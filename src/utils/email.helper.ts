import { transporter } from '@/configs/nodeMailer.config';

export const sendEmail = async (emailReceiver: string, subject: string, content: string) => {
  console.log('Send email to', emailReceiver);
  return transporter.sendMail({
    from: 'xomtro@support.com',
    to: emailReceiver,
    subject: subject,
    html: content
  });
};

export type emailContentOptions = {
  headerText?: string;
  mainText?: string;
  footerText?: string;
  bodyText?: string;
  bodySubText?: string;
};

export const generateVerifyEmailContent = (
  verifyText: string,
  expirationTime: number | string,
  options?: emailContentOptions
) => {
  const { headerText, mainText, footerText } = options || {};
  return `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background-color: #0B6BCB; padding: 20px; text-align: center;">
          <h1 style="color: #fff; font-size: 24px; margin: 0;">${headerText ? headerText : ''}</h1>
      </div>

      <!-- Main content -->
      <div style="padding: 20px;">
          <h2 style="color: #0B6BCB; text-align: center;">${mainText ? mainText : ''}</h2>
          <p>Xin chào,</p>
          <p>Chúng tôi nhận được một yêu cầu <strong>xác thực tài khoản</strong>. Hãy sử dụng <strong>thông tin</strong> dưới đây để tiếp tục:</p>
          <div style="text-align: center; margin: 20px 0;">
              <span style="display: inline-block; background-color: #f1f1f1; padding: 10px 20px; font-size: 28px; font-weight: bold; color: #4CAF50; border-radius: 8px;">${verifyText}</span>
          </div>
          <p style="text-align: center;">Đoạn thông tin được cung cấp có hiệu lực tới <strong>${expirationTime}</strong>.</p>
          <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
          <p>Xin chân thành cảm ơn!.</p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f1f1; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #888;">${footerText ? footerText : 'Bạn nhận được email này để xác thực tài khoản.'}</p>
          <p style="font-size: 12px; color: #888;">&copy; 2024 xomtro.com. All rights reserved.</p>
      </div>
  </div>
`;
};

export const generateEmailContent = (username?: string, options?: emailContentOptions) => {
  const { headerText, mainText, footerText, bodyText, bodySubText } = options || {};
  return `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background-color: #0B6BCB; padding: 20px; text-align: center;">
          <h1 style="color: #fff; font-size: 24px; margin: 0;">${headerText ? headerText : ''}</h1>
      </div>

      <!-- Main content -->
      <div style="padding: 20px;">
          <h2 style="color: #0B6BCB; text-align: center;">${mainText ? mainText : ''}</h2>
          <strong>Xin chào, ${username ? username : ''}!</strong>
          <p>${bodyText ? bodyText : ''}</p>
          <p>${bodySubText ? bodySubText : ''}</p>
          <p>Xin chân thành cảm ơn!.</p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f1f1; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #888;">${footerText ? footerText : ''}</p>
          <p style="font-size: 12px; color: #888;">&copy; 2024 xomtro.com. All rights reserved.</p>
      </div>
  </div>
`;
};
