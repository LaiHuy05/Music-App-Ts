import { randomBytes, scrypt, timingSafeEqual, createHash } from "crypto";
import { Request, Response } from "express";
import Session from "../models/session.model";

const derive = (password: string, salt: string) => new Promise<Buffer>((resolve, reject) => {
  scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key));
});
export const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt);
  return `scrypt:${salt}:${key.toString("hex")}`;
};
export const verifyPassword = async (password: string, hash: string) => {
  const [algorithm, salt, key] = (hash || "").split(":");
  if (algorithm !== "scrypt" || !salt || !/^[a-f0-9]{128}$/.test(key || "")) return false;
  const actual = await derive(password, salt);
  return timingSafeEqual(actual, Buffer.from(key, "hex"));
};
export const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
export const cookieName = (kind: "admin" | "client") => kind === "admin" ? "music_admin" : "music_user";
export const readCookie = (req: Request, name: string) => {
  const item = (req.headers.cookie || "").split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  try { return item ? decodeURIComponent(item.slice(name.length + 1)) : ""; } catch { return ""; }
};
export const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" });
export const createSession = async (req: Request, res: Response, kind: "admin" | "client", accountId: string) => {
  const oldToken = readCookie(req, cookieName(kind));
  if (oldToken) await Session.deleteOne({ tokenHash: tokenHash(oldToken), kind });
  const token = randomBytes(32).toString("hex");
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  await Session.create({ accountId, kind, tokenHash: tokenHash(token), expiresAt: new Date(Date.now() + maxAge) });
  res.cookie(cookieName(kind), token, { ...cookieOptions(), maxAge });
};
export const logout = async (req: Request, res: Response, kind: "admin" | "client") => {
  const token = readCookie(req, cookieName(kind));
  if (token) await Session.deleteOne({ tokenHash: tokenHash(token), kind });
  res.clearCookie(cookieName(kind), cookieOptions());
};
export const revokeSessions = (accountId: string, kind: "admin" | "client") => Session.deleteMany({ accountId, kind });
