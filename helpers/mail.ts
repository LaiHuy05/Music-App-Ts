import nodemailer from "nodemailer";
import { HttpError } from "./http";

export const requireMailConfig = () => {
  if (!process.env.SMTP_HOST || !process.env.MAIL_FROM || !process.env.APP_URL) throw new HttpError(503, "Chức năng quên mật khẩu chưa được cấu hình email.");
};
export const sendPasswordReset = async (recipient: string, token: string) => {
  requireMailConfig();
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    connectionTimeout: 10000,
    socketTimeout: 10000
  });
  const link = `${process.env.APP_URL.replace(/\/$/, "")}/user/password/reset/${token}`;
  await transport.sendMail({
    from: process.env.MAIL_FROM,
    to: recipient,
    subject: "Đặt lại mật khẩu Music App",
    text: `Mở liên kết sau để đặt lại mật khẩu (hết hạn sau 15 phút):\n${link}\nNếu bạn không yêu cầu, hãy bỏ qua email này.`
  });
};
