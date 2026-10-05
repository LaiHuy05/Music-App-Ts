import { Request, Response } from "express";
import { randomBytes } from "crypto";
import User from "../../models/user.model";
import PasswordReset from "../../models/password-reset.model";
import { email, password, requiredText, text, mediaUrl, success, safeNext, HttpError } from "../../helpers/http";
import { hashPassword, verifyPassword, createSession, logout as endSession, tokenHash, revokeSessions } from "../../helpers/auth";
import { requireMailConfig, sendPasswordReset } from "../../helpers/mail";

export const login = (req: Request, res: Response) => res.render("client/pages/user/login", { pageTitle: "Đăng nhập", next: safeNext(req.query.next) });
export const loginPost = async (req: Request, res: Response) => {
  const user = await User.findOne({ email: email(req.body.email), deleted: false, status: "active" }).select("+password");
  if (!user || !await verifyPassword(password(req.body.password), user.password)) throw new HttpError(400, "Email hoặc mật khẩu không đúng.");
  await createSession(req, res, "client", user.id);
  res.redirect(safeNext(req.body.next));
};
export const register = (_req: Request, res: Response) => res.render("client/pages/user/register", { pageTitle: "Đăng ký" });
export const registerPost = async (req: Request, res: Response) => {
  const plain = password(req.body.password);
  if (plain !== req.body.confirmPassword) throw new HttpError(400, "Mật khẩu xác nhận không khớp.");
  const user = await User.create({ fullName: requiredText(req.body.fullName, "họ tên", 100), email: email(req.body.email), password: await hashPassword(plain) });
  await createSession(req, res, "client", user.id);
  success(res, "/user/info", "Đăng ký thành công.");
};
export const logout = async (req: Request, res: Response) => { await endSession(req, res, "client"); res.redirect("/user/login"); };
export const info = (_req: Request, res: Response) => res.render("client/pages/user/info", { pageTitle: "Thông tin cá nhân", user: res.locals.currentUser });
export const infoPatch = async (req: Request, res: Response) => {
  const userId = res.locals.currentUser.id;
  const data: any = { fullName: requiredText(req.body.fullName, "họ tên", 100), phone: text(req.body.phone, 30) };
  const avatar = Array.isArray(req.body.avatar) ? req.body.avatar[0] : req.body.avatarUrl;
  if (avatar) data.avatar = mediaUrl(avatar);
  if (req.body.newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user || !await verifyPassword(String(req.body.currentPassword || ""), user.password)) throw new HttpError(400, "Mật khẩu hiện tại không đúng.");
    const plain = password(req.body.newPassword);
    if (plain !== req.body.confirmPassword) throw new HttpError(400, "Mật khẩu xác nhận không khớp.");
    data.password = await hashPassword(plain);
  }
  await User.updateOne({ _id: userId, deleted: false }, { $set: data }, { runValidators: true });
  if (data.password) {
    await revokeSessions(userId, "client");
    await createSession(req, res, "client", userId);
  }
  success(res, "/user/info");
};
export const forgotPassword = (_req: Request, res: Response) => res.render("client/pages/user/forgot-password", { pageTitle: "Quên mật khẩu" });
export const forgotPasswordPost = async (req: Request, res: Response) => {
  requireMailConfig();
  const user = await User.findOne({ email: email(req.body.email), status: "active", deleted: false });
  if (user) {
    const token = randomBytes(32).toString("hex");
    await PasswordReset.deleteMany({ userId: user.id });
    const reset = await PasswordReset.create({ userId: user.id, tokenHash: tokenHash(token), expiresAt: new Date(Date.now() + 15 * 60 * 1000) });
    try { await sendPasswordReset(user.email, token); }
    catch {
      await PasswordReset.deleteOne({ _id: reset.id });
      console.error("Không gửi được email đặt lại mật khẩu.");
    }
  }
  success(res, "/user/password/forgot", "Nếu email đã đăng ký, hướng dẫn đặt lại mật khẩu sẽ được gửi tới hộp thư.");
};
export const resetPassword = async (req: Request, res: Response) => {
  const token = text(req.params.token, 64);
  const reset = await PasswordReset.findOne({ tokenHash: tokenHash(token), expiresAt: { $gt: new Date() } });
  if (!reset) throw new HttpError(400, "Liên kết đã hết hạn hoặc đã được sử dụng.");
  res.render("client/pages/user/reset-password", { pageTitle: "Đặt lại mật khẩu", token });
};
export const resetPasswordPost = async (req: Request, res: Response) => {
  const plain = password(req.body.password);
  if (plain !== req.body.confirmPassword) throw new HttpError(400, "Mật khẩu xác nhận không khớp.");
  const hashed = await hashPassword(plain);
  const reset = await PasswordReset.findOneAndDelete({ tokenHash: tokenHash(text(req.params.token, 64)), expiresAt: { $gt: new Date() } });
  if (!reset) throw new HttpError(400, "Liên kết đã hết hạn hoặc đã được sử dụng.");
  const result = await User.updateOne({ _id: reset.userId, deleted: false, status: "active" }, { $set: { password: hashed } });
  if (!result.matchedCount) throw new HttpError(400, "Tài khoản không còn hoạt động.");
  await PasswordReset.deleteMany({ userId: reset.userId });
  await revokeSessions(reset.userId, "client");
  success(res, "/user/login", "Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
};
