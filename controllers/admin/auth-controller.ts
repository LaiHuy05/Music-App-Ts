import { Request, Response } from "express";
import Account from "../../models/account.model";
import Role from "../../models/role.model";
import { email, password, HttpError } from "../../helpers/http";
import { createSession, verifyPassword, logout as endSession } from "../../helpers/auth";
import { systemconfig } from "../../config/config";

export const login = (_req: Request, res: Response) => res.render("admin/pages/auth/login", { pageTitle: "Đăng nhập quản trị" });
export const loginPost = async (req: Request, res: Response) => {
  const account = await Account.findOne({ email: email(req.body.email), deleted: false, status: "active" }).select("+password");
  if (!account || !await verifyPassword(password(req.body.password), account.password)) throw new HttpError(400, "Email hoặc mật khẩu không đúng.");
  await createSession(req, res, "admin", account.id);
  const role = account.roleId ? await Role.findOne({ _id: account.roleId, status: "active", deleted: false }) : null;
  res.redirect(`/${systemconfig.prefixAdmin}/${account.isSuperAdmin || role?.permissions.includes("dashboard_view") ? "dashboard" : "my-account"}`);
};
export const logout = async (req: Request, res: Response) => {
  await endSession(req, res, "admin");
  res.redirect(`/${systemconfig.prefixAdmin}/auth/login`);
};
