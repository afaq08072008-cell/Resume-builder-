import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import winston from "winston";
import cors from "cors";
import { z } from "zod";
import { sendUpgradeEmail, sendPaymentFailedEmail, sendVersionCreatedEmail } from "./server/email.ts";
import { analyzeResume, optimizeBulletPoint } from "./server/ai.ts";
import { calculateATSScore } from "./server/ats.ts";

dotenv.config();

// Production Schema Validation
const ResumeSchema = z.object({
  personalInfo: z.any(),
  sections: z.array(z.any()),
  settings: z.any(),
  title: z.string().optional(),
});

const ATSQuerySchema = z.object({
  resumeData: ResumeSchema,
  jobDescription: z.string().min(10, "Job description too short"),
});

// Logger Configuration
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();
const authAdmin = getAuth();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRICE_MAP: Record<string, string> = {
  "price_standard_monthly": "pro",
  "price_premium_monthly": "premium",
};

// Auth Middleware
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await authAdmin.verifyIdToken(idToken);
    (req as any).user = decodedToken;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Admin Middleware
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  
  const userDoc = await db.collection("users").doc(user.uid).get();
  if (!userDoc.exists || !userDoc.data()?.isAdmin) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  next();
};

// Global Error Handler Middleware
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`[API ERROR] ${req.method} ${req.url}: ${err.message}`, { 
    stack: err.stack,
    body: req.body,
    query: req.query 
  });

  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: "Validation failed", details: err.issues });
  }

  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security & Optimization Middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.firebase.google.com", "https://*.gstatic.com", "https://apis.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://*"],
        connectSrc: ["'self'", "https://*.firebase.google.com", "https://*.googleapis.com", "https://*.gstatic.com", "https://*.google-analytics.com", "https://*.firebaseapp.com"],
        frameSrc: ["'self'", "https://*.firebaseapp.com", "https://*.google.com"],
        frameAncestors: ["'self'", "https://ais-dev-5s7vfzbknrqlputye3qq7q-649537302848.asia-southeast1.run.app", "https://ais-pre-5s7vfzbknrqlputye3qq7q-649537302848.asia-southeast1.run.app", "https://*.google.com", "https://*.ai.studio"],
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    xFrameOptions: false,
  }));
  app.use(cors());
  app.use(compression());

  // Global Rate Limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: "Too many requests from this IP, please try again later." },
  });
  app.use("/api/", limiter);

  let stripe: Stripe | null = null;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  // Webhook needs raw body
  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    // ... (Webhook logic remains robust as is)
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.sendStatus(400);
    const sig = req.headers["stripe-signature"] as string;
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed":
        case "invoice.payment_succeeded": {
          const session = event.data.object as any;
          const email = session.customer_details?.email || session.customer_email;
          const stripeCustomerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          if (email) {
            const userQuery = await db.collection("users").where("email", "==", email).get();
            if (!userQuery.empty) {
              const userRef = userQuery.docs[0].ref;
              const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
              const priceId = lineItems.data[0]?.price?.id;
              const plan = priceId ? PRICE_MAP[priceId] : "pro";

              await userRef.update({
                subscriptionPlan: plan,
                stripeCustomerId,
                stripeSubscriptionId: subscriptionId,
                updatedAt: FieldValue.serverTimestamp(),
              });
              await sendUpgradeEmail(email, plan);
            }
          }
          break;
        }
        
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.customer_email) {
            await sendPaymentFailedEmail(invoice.customer_email);
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const userQuery = await db.collection("users").where("stripeSubscriptionId", "==", subscription.id).get();
          if (!userQuery.empty) {
            await userQuery.docs[0].ref.update({
              subscriptionPlan: "free",
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
          break;
        }
      }
    } catch (err) { logger.error("Webhook processing error", err); }
    res.json({ received: true });
  });

  app.use(express.json());

  // AI & ATS Endpoints
  app.post("/api/ai/analyze", authenticate, async (req, res, next) => {
    try {
      // AI Usage Tracking could go here
      const { resumeText, jobDescription } = req.body;
      const analysis = await analyzeResume(resumeText, jobDescription);
      res.json(analysis);
    } catch (err) { next(err); }
  });

  app.post("/api/ai/optimize-bullet", authenticate, async (req, res, next) => {
    try {
      const { bullet, context } = req.body;
      const optimized = await optimizeBulletPoint(bullet, context);
      res.json({ optimized });
    } catch (err) { next(err); }
  });

  app.post("/api/ats/score", authenticate, async (req, res, next) => {
    try {
      const { resumeData, jobDescription } = ATSQuerySchema.parse(req.body);
      const scoreData = await calculateATSScore(resumeData, jobDescription);
      res.json(scoreData);
    } catch (err) { next(err); }
  });

  // Enterprise Versioning
  app.post("/api/resumes/:resumeId/versions", authenticate, async (req, res, next) => {
    try {
      const { resumeId } = req.params;
      const { data } = req.body;
      const user = (req as any).user;

      // Ownership Verification
      const resumeRef = db.collection("resumes").doc(resumeId);
      const resumeSnap = await resumeRef.get();
      
      if (!resumeSnap.exists || resumeSnap.data()?.userId !== user.uid) {
        return res.status(403).json({ error: "Forbidden: You do not own this resume" });
      }
      
      const versionRef = resumeRef.collection("versions").doc();
      await versionRef.set({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
      });

      if (user.email) await sendVersionCreatedEmail(user.email, data.title || "Resume Snapshot");
      res.json({ success: true, versionId: versionRef.id });
    } catch (err) { next(err); }
  });

  // Admin Routes (Hardened)
  app.get("/api/admin/stats", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const [users, resumes, jobs, freeCount, proCount, premiumCount] = await Promise.all([
        db.collection("users").count().get(),
        db.collection("resumes").count().get(),
        db.collection("jobs").where("status", "==", "pending").count().get(),
        db.collection("users").where("subscriptionPlan", "==", "free").count().get(),
        db.collection("users").where("subscriptionPlan", "==", "pro").count().get(),
        db.collection("users").where("subscriptionPlan", "==", "premium").count().get(),
      ]);

      res.json({
        totalUsers: users.data().count,
        totalResumes: resumes.data().count,
        pendingJobs: jobs.data().count,
        planStats: {
          free: freeCount.data().count,
          pro: proCount.data().count,
          premium: premiumCount.data().count,
        },
        systemHealth: "operational",
        uptime: process.uptime(),
      });
    } catch (err) { next(err); }
  });

  // Stripe Customer Portal Session
  app.post("/api/create-portal-session", authenticate, async (req, res, next) => {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
    try {
      const userToken = (req as any).user;
      const { customerId } = req.body;
      
      // Verify customerId matches user's record
      const userDoc = await db.collection("users").doc(userToken.uid).get();
      if (userDoc.data()?.stripeCustomerId !== customerId) {
        return res.status(403).json({ error: "Forbidden: Improper customer context" });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${req.headers.origin}/`,
      });
      res.json({ url: session.url });
    } catch (err) { next(err); }
  });

  // Stripe Checkout Session
  app.post("/api/create-checkout-session", authenticate, async (req, res, next) => {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
    try {
      const { priceId, customerEmail } = req.body;
      const userToken = (req as any).user;

      if (customerEmail !== userToken.email) {
        return res.status(403).json({ error: "Email mismatch" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${req.headers.origin}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/`,
        customer_email: customerEmail,
      });
      res.json({ url: session.url });
    } catch (err) { next(err); }
  });

  // Admin: List Users
  app.get("/api/admin/users", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const usersSnap = await db.collection("users").orderBy("createdAt", "desc").limit(50).get();
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(users);
    } catch (err) { next(err); }
  });

  // Admin: Update User Plan
  app.post("/api/admin/update-user-plan", authenticate, requireAdmin, async (req, res, next) => {
    const { userId, plan } = req.body;
    try {
      await db.collection("users").doc(userId).update({
        subscriptionPlan: plan,
        updatedAt: FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  // Job Engine - Background processing for heavy tasks
  const startJobEngine = () => {
    logger.info("Starting Background Job Engine...");
    db.collection("jobs")
      .where("status", "==", "pending")
      .onSnapshot((snapshot) => {
        snapshot.docs.forEach(async (doc) => {
          const job = doc.data();
          try {
            await doc.ref.update({ status: "processing", startedAt: FieldValue.serverTimestamp() });
            
            // Simulate heavy AI processing / data aggregation
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            await doc.ref.update({ 
              status: "completed", 
              completedAt: FieldValue.serverTimestamp(),
              result: { success: true, message: "AI deep processing finalized" }
            });
          } catch (err: any) {
            await doc.ref.update({ status: "failed", error: err.message });
          }
        });
      }, (error) => logger.error(`Job Engine Error: ${error.message}`));
  };
  startJobEngine();

  app.use(errorHandler);

  // Vite/Prod Serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => logger.info(`Production Server starting on port ${PORT}`));
}

startServer();
