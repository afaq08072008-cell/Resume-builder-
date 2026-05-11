import { GoogleGenerativeAI } from "@google/generative-ai";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzeResume(resumeContent: string, jobDescription?: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze the following resume and provide a structured JSON response.
    ${jobDescription ? `Compare it against this job description: ${jobDescription}` : "General analysis for career growth."}

    Resume Content:
    ${resumeContent}

    The JSON response must follow this schema:
    {
      "score": number (0-100),
      "analysis": string (detailed overview),
      "strengths": string[],
      "weaknesses": string[],
      "improvements": {
        "content": string[],
        "keywords": string[],
        "formatting": string[]
      },
      "atsKeywords": string[]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Basic extraction logic for JSON if model wraps it in markdown
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (err: any) {
    logger.error("AI Analysis Error", err);
    throw new Error("Failed to analyze resume with AI");
  }
}

export async function optimizeBulletPoint(bullet: string, context: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Rewrite the following resume bullet point to be more impact-oriented and ATS-friendly using the STAR method (Situation, Task, Action, Result).
    Context: ${context}
    Original Bullet: ${bullet}
    
    Return ONLY the optimized string.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    logger.error("AI Optimization Error", err);
    return bullet;
  }
}
