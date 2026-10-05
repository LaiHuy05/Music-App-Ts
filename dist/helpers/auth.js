"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeSessions = exports.logout = exports.createSession = exports.cookieOptions = exports.readCookie = exports.cookieName = exports.tokenHash = exports.verifyPassword = exports.hashPassword = void 0;
const crypto_1 = require("crypto");
const session_model_1 = __importDefault(require("../models/session.model"));
const derive = (password, salt) => new Promise((resolve, reject) => {
    (0, crypto_1.scrypt)(password, salt, 64, (error, key) => error ? reject(error) : resolve(key));
});
const hashPassword = async (password) => {
    const salt = (0, crypto_1.randomBytes)(16).toString("hex");
    const key = await derive(password, salt);
    return `scrypt:${salt}:${key.toString("hex")}`;
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, hash) => {
    const [algorithm, salt, key] = (hash || "").split(":");
    if (algorithm !== "scrypt" || !salt || !/^[a-f0-9]{128}$/.test(key || ""))
        return false;
    const actual = await derive(password, salt);
    return (0, crypto_1.timingSafeEqual)(actual, Buffer.from(key, "hex"));
};
exports.verifyPassword = verifyPassword;
const tokenHash = (token) => (0, crypto_1.createHash)("sha256").update(token).digest("hex");
exports.tokenHash = tokenHash;
const cookieName = (kind) => kind === "admin" ? "music_admin" : "music_user";
exports.cookieName = cookieName;
const readCookie = (req, name) => {
    const item = (req.headers.cookie || "").split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
    try {
        return item ? decodeURIComponent(item.slice(name.length + 1)) : "";
    }
    catch {
        return "";
    }
};
exports.readCookie = readCookie;
const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
exports.cookieOptions = cookieOptions;
const createSession = async (req, res, kind, accountId) => {
    const oldToken = (0, exports.readCookie)(req, (0, exports.cookieName)(kind));
    if (oldToken)
        await session_model_1.default.deleteOne({ tokenHash: (0, exports.tokenHash)(oldToken), kind });
    const token = (0, crypto_1.randomBytes)(32).toString("hex");
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    await session_model_1.default.create({ accountId, kind, tokenHash: (0, exports.tokenHash)(token), expiresAt: new Date(Date.now() + maxAge) });
    res.cookie((0, exports.cookieName)(kind), token, { ...(0, exports.cookieOptions)(), maxAge });
};
exports.createSession = createSession;
const logout = async (req, res, kind) => {
    const token = (0, exports.readCookie)(req, (0, exports.cookieName)(kind));
    if (token)
        await session_model_1.default.deleteOne({ tokenHash: (0, exports.tokenHash)(token), kind });
    res.clearCookie((0, exports.cookieName)(kind), (0, exports.cookieOptions)());
};
exports.logout = logout;
const revokeSessions = (accountId, kind) => session_model_1.default.deleteMany({ accountId, kind });
exports.revokeSessions = revokeSessions;
