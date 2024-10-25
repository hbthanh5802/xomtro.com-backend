import { transporter } from '@/configs/nodeMailer.config';

export const sendEmail = async (emailReceiver: string, subject: string, content: string) => {
  return transporter.sendMail({
    from: 'xomtro@support.com',
    to: emailReceiver,
    subject: subject,
    html: content
  });
};

export type emailContentOptions = { headerText?: string; mainText?: string; footerText?: string };

export const generateVerifyEmailContent = (
  verifyText: string,
  expirationTime: number | string,
  options?: emailContentOptions
) => {
  const { headerText, mainText, footerText } = options || {};
  return `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
          <h1 style="color: #fff; font-size: 24px; margin: 0;">${headerText ? headerText : ''}</h1>
      </div>

      <!-- Main content -->
      <div style="padding: 20px;">
          <h2 style="color: #4CAF50; text-align: center;">${mainText ? mainText : ''}</h2>
          <p>Hello,</p>
          <p>We have received a request to verify your account. Please use the <strong>document</strong> below to proceed:</p>
          <div style="text-align: center; margin: 20px 0;">
              <span style="display: inline-block; background-color: #f1f1f1; padding: 10px 20px; font-size: 28px; font-weight: bold; color: #4CAF50; border-radius: 8px;">${verifyText}</span>
          </div>
          <p style="text-align: center;">The confirmation document is valid until <strong>${expirationTime}</strong>.</p>
          <p>If you did not request this code, please ignore this email.</p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f1f1; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #888;">${footerText ? footerText : 'You received this email because you requested account verification.'}</p>
          <p style="font-size: 12px; color: #888;">&copy; 2024 Your Company. All rights reserved.</p>
      </div>
  </div>
`;
};
