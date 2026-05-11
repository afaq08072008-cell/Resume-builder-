import sgMail from '@sendgrid/mail';
import winston from 'winston';

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

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'notifications@apex-resume.pro';

export async function sendUpgradeEmail(to: string, plan: string) {
  if (!process.env.SENDGRID_API_KEY) {
    logger.warn('SendGrid API Key missing, skipping upgrade email');
    return;
  }

  const msg = {
    to,
    from: FROM_EMAIL,
    subject: 'Welcome to the Pros! Subscription Upgraded',
    text: `Your Apex-Resume Pro account has been upgraded to the ${plan} plan. Start building your enterprise-grade resume now!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 20px;">
        <h1 style="color: #3b82f6; text-transform: uppercase; font-weight: 900;">Apex-Resume Pro</h1>
        <p style="font-size: 18px;">Your account has been upgraded to <strong>${plan.toUpperCase()}</strong>.</p>
        <p>Unlock deep AI analysis, priority job queues, and premium templates today.</p>
        <a href="https://apex-resume.pro/builder" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px;">Open Builder</a>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    logger.info(`Upgrade email sent to ${to}`);
  } catch (error: any) {
    logger.error('Error sending upgrade email', error);
  }
}

export async function sendPaymentFailedEmail(to: string) {
  if (!process.env.SENDGRID_API_KEY) {
    logger.warn('SendGrid API Key missing, skipping payment failed email');
    return;
  }

  const msg = {
    to,
    from: FROM_EMAIL,
    subject: 'Attention: Payment Failed',
    text: `We were unable to process your recent payment for Apex-Resume Pro. Please update your billing information to keep your premium features.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #ef4444;">
        <h1 style="color: #ef4444; text-transform: uppercase; font-weight: 900;">Payment Action Required</h1>
        <p style="font-size: 16px;">We encountered an issue processing your subscription payment.</p>
        <p>To avoid service interruption and maintain your Pro features, please update your billing details.</p>
        <a href="https://apex-resume.pro/settings" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px;">Update Billing</a>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    logger.info(`Payment failed email sent to ${to}`);
  } catch (error: any) {
    logger.error('Error sending payment failed email', error);
  }
}

export async function sendVersionCreatedEmail(to: string, resumeTitle: string) {
  if (!process.env.SENDGRID_API_KEY) {
    logger.warn('SendGrid API Key missing, skipping version email');
    return;
  }

  const msg = {
    to,
    from: FROM_EMAIL,
    subject: `New version of "${resumeTitle}" created`,
    text: `A new snapshot of your resume "${resumeTitle}" has been saved. You can roll back to this version at any time.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 20px;">
        <h1 style="color: #8b5cf6; text-transform: uppercase; font-weight: 900;">Snapshot Created</h1>
        <p style="font-size: 16px;">A new version of <strong>${resumeTitle}</strong> is now securely stored in your version history.</p>
        <p>Keep iterating with peace of mind!</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    logger.info(`Version created email sent to ${to}`);
  } catch (error: any) {
    logger.error('Error sending version email', error);
  }
}
