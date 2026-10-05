"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.requireAdmin = exports.requireUser = exports.loadAuth = void 0;
const account_model_1 = __importDefault(require("../models/account.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const role_model_1 = __importDefault(require("../models/role.model"));
const session_model_1 = __importDefault(require("../models/session.model"));
const auth_1 = require("../helpers/auth");
const http_1 = require("../helpers/http");
const config_1 = require("../config/config");
const loadAuth = async (req, res, next) => {
    res.locals.currentUser = null;
    res.locals.currentAdmin = null;
    res.locals.permissions = [];
    for (const kind of ["client", "admin"]) {
        const token = (0, auth_1.readCookie)(req, (0, auth_1.cookieName)(kind));
        if (!/^[a-f0-9]{64}$/.test(token))
            continue;
        const session = await session_model_1.default.findOne({ kind, tokenHash: (0, auth_1.tokenHash)(token), expiresAt: { $gt: new Date() } });
        const filter = session ? { _id: session.accountId, status: "active", deleted: false } : null;
        const account = !filter ? null : kind === "admin" ? await account_model_1.default.findOne(filter) : await user_model_1.default.findOne(filter);
        if (!account) {
            res.clearCookie((0, auth_1.cookieName)(kind), (0, auth_1.cookieOptions)());
            continue;
        }
        if (kind === "client")
            res.locals.currentUser = account;
        else {
            res.locals.currentAdmin = account;
            const role = account["roleId"] ? await role_model_1.default.findOne({ _id: account["roleId"], status: "active", deleted: false }) : null;
            res.locals.permissions = role?.permissions || [];
        }
    }
    res.locals.can = (permission) => !!res.locals.currentAdmin && (res.locals.currentAdmin.isSuperAdmin || res.locals.permissions.includes(permission));
    next();
};
exports.loadAuth = loadAuth;
const requireUser = (req, res, next) => {
    if (res.locals.currentUser)
        return next();
    if ((0, http_1.isJsonRequest)(req))
        return res.status(401).json({ code: 401, message: "Vui lòng đăng nhập.", redirect: "/user/login" });
    res.redirect(`/user/login?next=${encodeURIComponent(req.originalUrl)}`);
};
exports.requireUser = requireUser;
const requireAdmin = (req, res, next) => {
    if (res.locals.currentAdmin)
        return next();
    if ((0, http_1.isJsonRequest)(req))
        return res.status(401).json({ code: 401, message: "Vui lòng đăng nhập quản trị.", redirect: `/${config_1.systemconfig.prefixAdmin}/auth/login` });
    res.redirect(`/${config_1.systemconfig.prefixAdmin}/auth/login`);
};
exports.requireAdmin = requireAdmin;
const requirePermission = (permission) => (_req, res, next) => {
    if (!res.locals.can(permission))
        throw new http_1.HttpError(403, "Bạn không có quyền thực hiện chức năng này.");
    next();
};
exports.requirePermission = requirePermission;
