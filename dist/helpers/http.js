"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFilter = exports.safeNext = exports.success = exports.mediaUrl = exports.status = exports.password = exports.email = exports.requiredText = exports.text = exports.objectId = exports.requireRecord = exports.isJsonRequest = exports.HttpError = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.HttpError = HttpError;
const isJsonRequest = (req) => req.get("accept")?.includes("application/json") || req.xhr;
exports.isJsonRequest = isJsonRequest;
const requireRecord = (record, message = "Không tìm thấy dữ liệu.") => {
    if (!record)
        throw new HttpError(404, message);
    return record;
};
exports.requireRecord = requireRecord;
const objectId = (value) => {
    if (typeof value !== "string" || !mongoose_1.default.isObjectIdOrHexString(value))
        throw new HttpError(400, "ID không hợp lệ.");
    return value;
};
exports.objectId = objectId;
const text = (value, max = 255) => typeof value === "string" ? value.trim().slice(0, max) : "";
exports.text = text;
const requiredText = (value, label, max = 255) => {
    const result = (0, exports.text)(value, max);
    if (!result)
        throw new HttpError(400, `Vui lòng nhập ${label}.`);
    return result;
};
exports.requiredText = requiredText;
const email = (value) => {
    const result = (0, exports.text)(value, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result))
        throw new HttpError(400, "Email không hợp lệ.");
    return result;
};
exports.email = email;
const password = (value) => {
    if (typeof value !== "string" || value.length < 8 || value.length > 128)
        throw new HttpError(400, "Mật khẩu cần từ 8 đến 128 ký tự.");
    return value;
};
exports.password = password;
const status = (value) => {
    if (value !== "active" && value !== "inactive")
        throw new HttpError(400, "Trạng thái không hợp lệ.");
    return value;
};
exports.status = status;
const mediaUrl = (value) => {
    const result = (0, exports.text)(value, 2048);
    if (result && !/^https?:\/\/[^\s]+$/i.test(result) && !/^\/(?!\/)[^\s]*$/.test(result))
        throw new HttpError(400, "Đường dẫn ảnh hoặc âm thanh không hợp lệ.");
    return result;
};
exports.mediaUrl = mediaUrl;
const success = (res, path, message = "Lưu thành công.") => res.redirect(`${path}?message=${encodeURIComponent(message)}`);
exports.success = success;
const safeNext = (value, fallback = "/") => typeof value === "string" && /^\/(?!\/)/.test(value) && !/[\\\r\n]/.test(value) ? value : fallback;
exports.safeNext = safeNext;
const listFilter = (req, field = "title") => {
    const filter = { deleted: false };
    const keyword = (0, exports.text)(req.query.keyword, 100);
    if (keyword)
        filter[field] = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (req.query.status === "active" || req.query.status === "inactive")
        filter.status = req.query.status;
    return filter;
};
exports.listFilter = listFilter;
