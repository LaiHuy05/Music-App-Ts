"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.loginPost = exports.login = void 0;
const account_model_1 = __importDefault(require("../../models/account.model"));
const role_model_1 = __importDefault(require("../../models/role.model"));
const http_1 = require("../../helpers/http");
const auth_1 = require("../../helpers/auth");
const config_1 = require("../../config/config");
const login = (_req, res) => res.render("admin/pages/auth/login", { pageTitle: "Đăng nhập quản trị" });
exports.login = login;
const loginPost = async (req, res) => {
    const account = await account_model_1.default.findOne({ email: (0, http_1.email)(req.body.email), deleted: false, status: "active" }).select("+password");
    if (!account || !await (0, auth_1.verifyPassword)((0, http_1.password)(req.body.password), account.password))
        throw new http_1.HttpError(400, "Email hoặc mật khẩu không đúng.");
    await (0, auth_1.createSession)(req, res, "admin", account.id);
    const role = account.roleId ? await role_model_1.default.findOne({ _id: account.roleId, status: "active", deleted: false }) : null;
    res.redirect(`/${config_1.systemconfig.prefixAdmin}/${account.isSuperAdmin || role?.permissions.includes("dashboard_view") ? "dashboard" : "my-account"}`);
};
exports.loginPost = loginPost;
const logout = async (req, res) => {
    await (0, auth_1.logout)(req, res, "admin");
    res.redirect(`/${config_1.systemconfig.prefixAdmin}/auth/login`);
};
exports.logout = logout;
