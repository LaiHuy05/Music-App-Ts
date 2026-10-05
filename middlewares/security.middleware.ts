import { randomBytes, createHmac, timingSafeEqual } from "crypto";
import { Request, Response, NextFunction } from "express";
import { cookieOptions, readCookie } from "../helpers/auth";
import { HttpError, text } from "../helpers/http";

const csrfCookie = "music_csrf";
// Development can use a process-local key. Production requires a stable secret across instances.
const developmentSecret = randomBytes(32).toString("hex");
const sign = (token: string) => createHmac("sha256", process.env.SESSION_SECRET || developmentSecret).update(token).digest("hex");
const valid = (value: string) => {
  const [token, signature] = value.split(".");
  return /^[a-f0-9]{64}$/.test(token || "") && /^[a-f0-9]{64}$/.test(signature || "") && timingSafeEqual(Buffer.from(sign(token)), Buffer.from(signature));
};
export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.set({ "X-Content-Type-Options": "nosniff", "X-Frame-Options": "SAMEORIGIN", "Referrer-Policy": "same-origin" });
  next();
};
export const csrfLocals = (req: Request, res: Response, next: NextFunction) => {
  let token = readCookie(req, csrfCookie);
  if (!valid(token)) {
    const nonce = randomBytes(32).toString("hex");
    token = `${nonce}.${sign(nonce)}`;
    res.cookie(csrfCookie, token, cookieOptions());
  }
  res.locals.csrfToken = token;
  next();
};
export const csrfProtection = (req: Request, _res: Response, next: NextFunction) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const token = req.get("X-CSRF-Token") || text(req.body?._csrf, 200);
  const cookie = readCookie(req, csrfCookie);
  if (!token || token !== cookie || !valid(cookie)) throw new HttpError(403, "Phiên biểu mẫu đã hết hạn. Vui lòng tải lại trang.");
  next();
};

// Rate limits live in MongoDB, so they also apply when deployed across serverless instances.
import AuthAttempt from "../models/auth-attempt.model";
import { tokenHash } from "../helpers/auth";
export const authRateLimit = (scope: string, limit = 15) => async (req: Request, _res: Response, next: NextFunction) => {
  const interval = 15 * 60 * 1000;
  const window = Math.floor(Date.now() / interval);
  const key = tokenHash(`${scope}:${req.ip}:${window}`);
  const attempt = await AuthAttempt.findOneAndUpdate({ key }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 2) * interval) } }, { upsert: true, returnDocument: "after" });
  if (attempt.count > limit) throw new HttpError(429, "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau 15 phút.");
  next();
};
