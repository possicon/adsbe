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

  async ConfirmOrder(
    email: string,
    firstName: string,
    lastName: string,
    amount: number,
    reference: string,
  ) {
    const mailOptions = {
      from: 'Ads.Ng <noreply@yourapp.com>',
      to: email,
      subject: 'Order Confirmation - Thank You for Your Purchase!',
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <div style="text-align: center; padding-bottom: 20px;">
                <img src="https://aicdn.picsart.com/f8f1f930-4637-4e74-808a-ea23074cc28a.png" alt="Ads.Ng Logo" style="width: 150px; margin-bottom: 20px;" />
                <h1 style="color: #333; font-size: 24px; margin-bottom: 5px;">Order Confirmed!</h1>
                <p style="font-size: 16px; color: #777;">Thank you for your purchase, ${firstName}!</p>
            </div>
  
            <!-- Content -->
            <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                <p style="font-size: 16px; color: #555;">
                    Dear <strong>${firstName} ${lastName}</strong>,
                </p>
                <p style="font-size: 16px; color: #555;">
                    We're happy to let you know that your order has been confirmed. Below are your order details:
                </p>
                <ul style="font-size: 16px; color: #555; padding-left: 20px;">
                <li><strong>Payment Gateway: </strong> Paystack</li>
                 <li><strong>Order Reference Number:</strong> ${reference}</li>
                    <li><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</li>
                    <li><strong>Transaction Status:</strong> pending</li>
                </ul>
                <p style="font-size: 16px; color: #555;">
                    You can  track your order with this reference number <strong> ${reference} </strong>
                </p>
                <p style="font-size: 16px; color: #555;">
                    You can access your dashboard for more details or to track your order.
                </p>
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
                <p style="margin: 0 0 10px;">Thanks for choosing Ads.Ng!</p>
                <p style="margin: 0 0 10px;">We're excited to help you grow your brand.</p>
                <p>&copy; ${new Date().getFullYear()} Ads.Ng. All rights reserved.</p>
            </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
  async VerifyOrder(
    email: string,
    firstName: string,
    lastName: string,
    amount: number,
    referencePay: string,
    trans_status: string,
  ) {
    const mailOptions = {
      from: 'Ads.Ng <noreply@yourapp.com>',
      to: email,
      subject: 'Payment Verified - Thank You for Your Payment!',
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <div style="text-align: center; padding-bottom: 20px;">
                <img src="https://aicdn.picsart.com/f8f1f930-4637-4e74-808a-ea23074cc28a.png" alt="Ads.Ng Logo" style="width: 150px; margin-bottom: 20px;" />
                <h1 style="color: #333; font-size: 24px; margin-bottom: 5px;">Payment Verified!</h1>
                <p style="font-size: 16px; color: #777;">Your transaction was successful.</p>
            </div>
  
            <!-- Content -->
            <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                <p style="font-size: 18px; color: #555;">Hello <strong>${firstName} ${lastName}</strong>,</p>
                <p style="font-size: 16px; color: #555;">
                    We’ve successfully received and verified your payment. Thank you for trusting Ads.Ng!
                </p>
                <ul style="font-size: 16px; color: #555; padding-left: 20px;">
                <li><strong>Payment Gateway: </strong> Paystack</li>
                 <li><strong>Payment Reference:</strong> ${referencePay}</li>
                    <li><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</li>
                    <li><strong>Transaction Status:</strong> ${trans_status}</li>
                </ul>
                <p style="font-size: 16px; color: #555;">
                    You can now access your dashboard to view your transactions and take the next steps.
                </p>
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
                <p style="margin: 0 0 10px;">Thanks for being part of Ads.Ng!</p>
                <p style="margin: 0 0 10px;">We’re here to support your journey to success.</p>
                <p>&copy; ${new Date().getFullYear()} Ads.Ng. All rights reserved.</p>
            </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
