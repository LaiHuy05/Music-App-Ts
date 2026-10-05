import { email, password, requiredText, status, text, mediaUrl } from "./http";
import { hashPassword } from "./auth";

export const accountData = async (body: any, creating = false) => {
  const data: any = {
    fullName: requiredText(body.fullName, "họ tên", 100),
    email: email(body.email), phone: text(body.phone, 30),
    avatar: mediaUrl(body.avatar), status: status(body.status)
  };
  if (creating || body.password) data.password = await hashPassword(password(body.password));
  return data;
};
