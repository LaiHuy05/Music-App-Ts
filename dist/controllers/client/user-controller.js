"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordPost = exports.resetPassword = exports.forgotPasswordPost = exports.forgotPassword = exports.infoPatch = exports.info = exports.logout = exports.registerPost = exports.register = exports.loginPost = exports.login = void 0;
const crypto_1 = require("crypto");
const user_model_1 = __importDefault(require("../../models/user.model"));
const password_reset_model_1 = __importDefault(require("../../models/password-reset.model"));
const http_1 = require("../../helpers/http");
const auth_1 = require("../../helpers/auth");
const mail_1 = require("../../helpers/mail");
const login = (req, res) => res.render("client/pages/user/login", { pageTitle: "Đăng nhập", next: (0, http_1.safeNext)(req.query.next) });
exports.login = login;
const loginPost = async (req, res) => {
    const user = await user_model_1.default.findOne({ email: (0, http_1.email)(req.body.email), deleted: false, status: "active" }).select("+password");
    if (!user || !await (0, auth_1.verifyPassword)((0, http_1.password)(req.body.password), user.password))
        throw new http_1.HttpError(400, "Email hoặc mật khẩu không đúng.");
    await (0, auth_1.createSession)(req, res, "client", user.id);
    res.redirect((0, http_1.safeNext)(req.body.next));
};
exports.loginPost = loginPost;
const register = (_req, res) => res.render("client/pages/user/register", { pageTitle: "Đăng ký" });
exports.register = register;
const registerPost = async (req, res) => {
    const plain = (0, http_1.password)(req.body.password);
    if (plain !== req.body.confirmPassword)
        throw new http_1.HttpError(400, "Mật khẩu xác nhận không khớp.");
    const user = await user_model_1.default.create({ fullName: (0, http_1.requiredText)(req.body.fullName, "họ tên", 100), email: (0, http_1.email)(req.body.email), password: await (0, auth_1.hashPassword)(plain) });
    await (0, auth_1.createSession)(req, res, "client", user.id);
    (0, http_1.success)(res, "/user/info", "Đăng ký thành công.");
};
exports.registerPost = registerPost;
const logout = async (req, res) => { await (0, auth_1.logout)(req, res, "client"); res.redirect("/user/login"); };
exports.logout = logout;
const info = (_req, res) => res.render("client/pages/user/info", { pageTitle: "Thông tin cá nhân", user: res.locals.currentUser });
exports.info = info;
const infoPatch = async (req, res) => {
    const userId = res.locals.currentUser.id;
    const data = { fullName: (0, http_1.requiredText)(req.body.fullName, "họ tên", 100), phone: (0, http_1.text)(req.body.phone, 30) };
    const avatar = Array.isArray(req.body.avatar) ? req.body.avatar[0] : req.body.avatarUrl;
    if (avatar)
        data.avatar = (0, http_1.mediaUrl)(avatar);
    if (req.body.newPassword) {
        const user = await user_model_1.default.findById(userId).select("+password");
        if (!user || !await (0, auth_1.verifyPassword)(String(req.body.currentPassword || ""), user.password))
            throw new http_1.HttpError(400, "Mật khẩu hiện tại không đúng.");
        const plain = (0, http_1.password)(req.body.newPassword);
        if (plain !== req.body.confirmPassword)
            throw new http_1.HttpError(400, "Mật khẩu xác nhận không khớp.");
        data.password = await (0, auth_1.hashPassword)(plain);
    }
    await user_model_1.default.updateOne({ _id: userId, deleted: false }, { $set: data }, { runValidators: true });
    if (data.password) {
        await (0, auth_1.revokeSessions)(userId, "client");
        await (0, auth_1.createSession)(req, res, "client", userId);
    }
    (0, http_1.success)(res, "/user/info");
};
exports.infoPatch = infoPatch;
const forgotPassword = (_req, res) => res.render("client/pages/user/forgot-password", { pageTitle: "Quên mật khẩu" });
exports.forgotPassword = forgotPassword;
const forgotPasswordPost = async (req, res) => {
    (0, mail_1.requireMailConfig)();
    const user = await user_model_1.default.findOne({ email: (0, http_1.email)(req.body.email), status: "active", deleted: false });
    if (user) {
        const token = (0, crypto_1.randomBytes)(32).toString("hex");
        await password_reset_model_1.default.deleteMany({ userId: user.id });
        const reset = await password_reset_model_1.default.create({ userId: user.id, tokenHash: (0, auth_1.tokenHash)(token), expiresAt: new Date(Date.now() + 15 * 60 * 1000) });
        try {
            await (0, mail_1.sendPasswordReset)(user.email, token);
        }
        catch {
            await password_reset_model_1.default.deleteOne({ _id: reset.id });
            console.error("Không gửi được email đặt lại mật khẩu.");
        }
    }
    (0, http_1.success)(res, "/user/password/forgot", "Nếu email đã đăng ký, hướng dẫn đặt lại mật khẩu sẽ được gửi tới hộp thư.");
};
exports.forgotPasswordPost = forgotPasswordPost;
const resetPassword = async (req, res) => {
    const token = (0, http_1.text)(req.params.token, 64);
    const reset = await password_reset_model_1.default.findOne({ tokenHash: (0, auth_1.tokenHash)(token), expiresAt: { $gt: new Date() } });
    if (!reset)
        throw new http_1.HttpError(400, "Liên kết đã hết hạn hoặc đã được sử dụng.");
    res.render("client/pages/user/reset-password", { pageTitle: "Đặt lại mật khẩu", token });
};
exports.resetPassword = resetPassword;
const resetPasswordPost = async (req, res) => {
    const plain = (0, http_1.password)(req.body.password);
    if (plain !== req.body.confirmPassword)
        throw new http_1.HttpError(400, "Mật khẩu xác nhận không khớp.");
    const hashed = await (0, auth_1.hashPassword)(plain);
    const reset = await password_reset_model_1.default.findOneAndDelete({ tokenHash: (0, auth_1.tokenHash)((0, http_1.text)(req.params.token, 64)), expiresAt: { $gt: new Date() } });
    if (!reset)
        throw new http_1.HttpError(400, "Liên kết đã hết hạn hoặc đã được sử dụng.");
    const result = await user_model_1.default.updateOne({ _id: reset.userId, deleted: false, status: "active" }, { $set: { password: hashed } });
    if (!result.matchedCount)
        throw new http_1.HttpError(400, "Tài khoản không còn hoạt động.");
    await password_reset_model_1.default.deleteMany({ userId: reset.userId });
    await (0, auth_1.revokeSessions)(reset.userId, "client");
    (0, http_1.success)(res, "/user/login", "Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
};
exports.resetPasswordPost = resetPasswordPost;
