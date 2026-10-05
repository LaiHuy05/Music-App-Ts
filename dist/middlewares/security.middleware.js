"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimit = exports.csrfProtection = exports.csrfLocals = exports.securityHeaders = void 0;
const crypto_1 = require("crypto");
const auth_1 = require("../helpers/auth");
const http_1 = require("../helpers/http");
const csrfCookie = "music_csrf";
const developmentSecret = (0, crypto_1.randomBytes)(32).toString("hex");
const sign = (token) => (0, crypto_1.createHmac)("sha256", process.env.SESSION_SECRET || developmentSecret).update(token).digest("hex");
const valid = (value) => {
    const [token, signature] = value.split(".");
    return /^[a-f0-9]{64}$/.test(token || "") && /^[a-f0-9]{64}$/.test(signature || "") && (0, crypto_1.timingSafeEqual)(Buffer.from(sign(token)), Buffer.from(signature));
};
const securityHeaders = (_req, res, next) => {
    res.set({ "X-Content-Type-Options": "nosniff", "X-Frame-Options": "SAMEORIGIN", "Referrer-Policy": "same-origin" });
    next();
};
exports.securityHeaders = securityHeaders;
const csrfLocals = (req, res, next) => {
    let token = (0, auth_1.readCookie)(req, csrfCookie);
    if (!valid(token)) {
        const nonce = (0, crypto_1.randomBytes)(32).toString("hex");
        token = `${nonce}.${sign(nonce)}`;
        res.cookie(csrfCookie, token, (0, auth_1.cookieOptions)());
    }
    res.locals.csrfToken = token;
    next();
};
exports.csrfLocals = csrfLocals;
const csrfProtection = (req, _res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method))
        return next();
    const token = req.get("X-CSRF-Token") || (0, http_1.text)(req.body?._csrf, 200);
    const cookie = (0, auth_1.readCookie)(req, csrfCookie);
    if (!token || token !== cookie || !valid(cookie))
        throw new http_1.HttpError(403, "Phiên biểu mẫu đã hết hạn. Vui lòng tải lại trang.");
    next();
};
exports.csrfProtection = csrfProtection;
const auth_attempt_model_1 = __importDefault(require("../models/auth-attempt.model"));
const auth_2 = require("../helpers/auth");
const authRateLimit = (scope, limit = 15) => async (req, _res, next) => {
    const interval = 15 * 60 * 1000;
    const window = Math.floor(Date.now() / interval);
    const key = (0, auth_2.tokenHash)(`${scope}:${req.ip}:${window}`);
    const attempt = await auth_attempt_model_1.default.findOneAndUpdate({ key }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 2) * interval) } }, { upsert: true, returnDocument: "after" });
    if (attempt.count > limit)
        throw new http_1.HttpError(429, "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau 15 phút.");
    next();
};
exports.authRateLimit = authRateLimit;
