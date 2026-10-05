import { Request, Response, NextFunction } from "express";
import Account from "../models/account.model";
import User from "../models/user.model";
import Role from "../models/role.model";
import Session from "../models/session.model";
import { readCookie, cookieName, tokenHash, cookieOptions } from "../helpers/auth";
import { HttpError, isJsonRequest } from "../helpers/http";
import { systemconfig } from "../config/config";

export const loadAuth = async (req: Request, res: Response, next: NextFunction) => {
  res.locals.currentUser = null;
  res.locals.currentAdmin = null;
  res.locals.permissions = [];
  for (const kind of ["client", "admin"] as const) {
    const token = readCookie(req, cookieName(kind));
    if (!/^[a-f0-9]{64}$/.test(token)) continue;
    const session = await Session.findOne({ kind, tokenHash: tokenHash(token), expiresAt: { $gt: new Date() } });
    const filter = session ? { _id: session.accountId, status: "active" as const, deleted: false } : null;
    const account = !filter ? null : kind === "admin" ? await Account.findOne(filter) : await User.findOne(filter);
    if (!account) { res.clearCookie(cookieName(kind), cookieOptions()); continue; }
    if (kind === "client") res.locals.currentUser = account;
    else {
      res.locals.currentAdmin = account;
      const role = account["roleId"] ? await Role.findOne({ _id: account["roleId"], status: "active", deleted: false }) : null;
      res.locals.permissions = role?.permissions || [];
    }
  }
  res.locals.can = (permission: string) => !!res.locals.currentAdmin && (res.locals.currentAdmin.isSuperAdmin || res.locals.permissions.includes(permission));
  next();
};
export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  if (res.locals.currentUser) return next();
  if (isJsonRequest(req)) return res.status(401).json({ code: 401, message: "Vui lòng đăng nhập.", redirect: "/user/login" });
  res.redirect(`/user/login?next=${encodeURIComponent(req.originalUrl)}`);
};
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (res.locals.currentAdmin) return next();
  if (isJsonRequest(req)) return res.status(401).json({ code: 401, message: "Vui lòng đăng nhập quản trị.", redirect: `/${systemconfig.prefixAdmin}/auth/login` });
  res.redirect(`/${systemconfig.prefixAdmin}/auth/login`);
};
export const requirePermission = (permission: string) => (_req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.can(permission)) throw new HttpError(403, "Bạn không có quyền thực hiện chức năng này.");
  next();
};
