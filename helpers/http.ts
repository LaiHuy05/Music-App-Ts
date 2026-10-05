import { Request, Response } from "express";
import mongoose from "mongoose";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const isJsonRequest = (req: Request) => req.get("accept")?.includes("application/json") || req.xhr;

export const requireRecord = <T>(record: T, message = "Không tìm thấy dữ liệu."): NonNullable<T> => {
  if (!record) throw new HttpError(404, message);
  return record as NonNullable<T>;
};

export const objectId = (value: unknown): string => {
  if (typeof value !== "string" || !mongoose.isObjectIdOrHexString(value)) throw new HttpError(400, "ID không hợp lệ.");
  return value;
};

export const text = (value: unknown, max = 255): string => typeof value === "string" ? value.trim().slice(0, max) : "";
export const requiredText = (value: unknown, label: string, max = 255) => {
  const result = text(value, max);
  if (!result) throw new HttpError(400, `Vui lòng nhập ${label}.`);
  return result;
};
export const email = (value: unknown) => {
  const result = text(value, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new HttpError(400, "Email không hợp lệ.");
  return result;
};
export const password = (value: unknown) => {
  if (typeof value !== "string" || value.length < 8 || value.length > 128) throw new HttpError(400, "Mật khẩu cần từ 8 đến 128 ký tự.");
  return value;
};
export const status = (value: unknown): "active" | "inactive" => {
  if (value !== "active" && value !== "inactive") throw new HttpError(400, "Trạng thái không hợp lệ.");
  return value;
};
export const mediaUrl = (value: unknown) => {
  const result = text(value, 2048);
  if (result && !/^https?:\/\/[^\s]+$/i.test(result) && !/^\/(?!\/)[^\s]*$/.test(result)) throw new HttpError(400, "Đường dẫn ảnh hoặc âm thanh không hợp lệ.");
  return result;
};
export const success = (res: Response, path: string, message = "Lưu thành công.") => res.redirect(`${path}?message=${encodeURIComponent(message)}`);
export const safeNext = (value: unknown, fallback = "/") => typeof value === "string" && /^\/(?!\/)/.test(value) && !/[\\\r\n]/.test(value) ? value : fallback;

export const listFilter = (req: Request, field = "title") => {
  const filter: any = { deleted: false };
  const keyword = text(req.query.keyword, 100);
  if (keyword) filter[field] = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (req.query.status === "active" || req.query.status === "inactive") filter.status = req.query.status;
  return filter;
};
