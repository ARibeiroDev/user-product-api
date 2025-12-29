import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendVerificationEmail(email: string, token: string) {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Click here to verify your email: 
             <a href="${process.env.CLIENT_URL}/api/v1/auth/verify-email?token=${token}">Verify Email</a></p>`,
    });
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click here to reset your password (copy the token from the url if testing the api): 
             <a href="${process.env.CLIENT_URL}/api/v1/auth/reset-password?token=${token}">Reset Password</a></p>`,
    });
  }
}
