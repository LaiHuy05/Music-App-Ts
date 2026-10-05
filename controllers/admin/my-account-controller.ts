import { Request, Response } from "express";
import Account from "../../models/account.model";
import { requiredText, text, mediaUrl, password, success, HttpError } from "../../helpers/http";
import { hashPassword, verifyPassword, revokeSessions, createSession } from "../../helpers/auth";
import { systemconfig } from "../../config/config";

export const index = (_req: Request, res: Response) => res.render("admin/pages/accounts/my-account", { pageTitle: "Tài khoản của tôi", record: res.locals.currentAdmin });
export const editPatch = async (req: Request, res: Response) => {
  const id = res.locals.currentAdmin.id;
  const data: any = { fullName: requiredText(req.body.fullName, "họ tên", 100), phone: text(req.body.phone, 30), avatar: mediaUrl(req.body.avatar) };
  if (req.body.newPassword) {
    const record = await Account.findById(id).select("+password");
    if (!record || !await verifyPassword(String(req.body.currentPassword || ""), record.password)) throw new HttpError(400, "Mật khẩu hiện tại không đúng.");
    const plain = password(req.body.newPassword);
    if (plain !== req.body.confirmPassword) throw new HttpError(400, "Mật khẩu xác nhận không khớp.");
    data.password = await hashPassword(plain);
  }
  await Account.updateOne({ _id: id, deleted: false }, { $set: data }, { runValidators: true });
  if (data.password) { await revokeSessions(id, "admin"); await createSession(req, res, "admin", id); }
  success(res, `/${systemconfig.prefixAdmin}/my-account`);
};
