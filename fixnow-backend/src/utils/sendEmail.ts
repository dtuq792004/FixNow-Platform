import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD?.replace(/\s/g, ""), // xoá khoảng trắng
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType?: string;
  }[];
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    throw error;
  }
};

export const sendResetPasswordEmail = async (
  to: string,
  resetLink: string
) => {
  return sendEmail({
    to,
    subject: "Đặt lại mật khẩu",
    html: `
      <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
      <p>Link có hiệu lực trong <b>5 phút</b>.</p>
      <a href="${resetLink}">Đổi mật khẩu</a>
      <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    `,
  });
};

export const sendOtpEmail = async (to: string, otp: string) => {
  return sendEmail({
    to,
    subject: "Mã xác thực OTP",
    html: `
      <h2>Mã OTP của bạn: <b>${otp}</b></h2>
      <p>Mã có hiệu lực trong <b>5 phút</b>.</p>
      <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    `,
  });
};
