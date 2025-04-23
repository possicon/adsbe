// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      // host: 'smtp.ethereal.email',
      // port: 587,
      auth: {
        user: 'djnchrys@gmail.com',
        pass: 'mictdtqklnuerfkg',
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `https://adsfe.ogini.com/reset-password?token=${token}`;
    const mailOptions = {
      from: 'Ads.Ng <noreply@yourapp.com>',
      to: to,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click on the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async signupMail(email: string, firstName: string, lastName: string) {
    const mailOptions = {
      from: 'Ads.Ng <noreply@yourapp.com>',
      to: email,
      subject: 'Welcome to Ads.Ng - Your Journey Starts Here!',
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <div style="text-align: center; padding-bottom: 20px;">
                <img src="https://aicdn.picsart.com/f8f1f930-4637-4e74-808a-ea23074cc28a.png" alt="Trainingbe Logo" style="width: 150px; margin-bottom: 20px;" />
                <h1 style="color: #333; font-size: 24px; margin-bottom: 5px;">Welcome to Ads.Ng!</h1>
                <p style="font-size: 16px; color: #777;">Your journey to learning and growing starts here.</p>
            </div>

            <!-- Content -->
            <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                <p style="font-size: 18px; color: #555;">Hello <strong>${firstName} ${lastName}</strong>,</p>
                <p style="font-size: 16px; color: #555;">
                    We're thrilled to have you join our community. Your signup was successful, and you're now part of a vibrant platform where knowledge and experience are shared to empower everyone. 
                </p>
                <p style="font-size: 16px; color: #555;">Click below to access your dashboard and explore:</p>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://adsfe.ogini.com/" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 5px;">
                        Go to Dashboard
                    </a>
                </div>
            </div>

            <!-- Divider -->
            <hr style="border-top: 1px solid #eeeeee; margin: 30px 0;" />

            <!-- Footer -->
            <div style="text-align: center; font-size: 14px; color: #999;">
                <p style="margin: 0 0 10px;">Thank you for joining Ads.Ng!</p>
                <p style="margin: 0 0 10px;">Share & Grow your knowledge with us.</p>
                <p>&copy; ${new Date().getFullYear()} Ads.Ng. All rights reserved.</p>
            </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
