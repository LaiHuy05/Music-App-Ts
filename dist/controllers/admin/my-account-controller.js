"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPatch = exports.index = void 0;
const account_model_1 = __importDefault(require("../../models/account.model"));
const http_1 = require("../../helpers/http");
const auth_1 = require("../../helpers/auth");
const config_1 = require("../../config/config");
const index = (_req, res) => res.render("admin/pages/accounts/my-account", { pageTitle: "Tài khoản của tôi", record: res.locals.currentAdmin });
exports.index = index;
const editPatch = async (req, res) => {
    const id = res.locals.currentAdmin.id;
    const data = { fullName: (0, http_1.requiredText)(req.body.fullName, "họ tên", 100), phone: (0, http_1.text)(req.body.phone, 30), avatar: (0, http_1.mediaUrl)(req.body.avatar) };
    if (req.body.newPassword) {
        const record = await account_model_1.default.findById(id).select("+password");
        if (!record || !await (0, auth_1.verifyPassword)(String(req.body.currentPassword || ""), record.password))
            throw new http_1.HttpError(400, "Mật khẩu hiện tại không đúng.");
        const plain = (0, http_1.password)(req.body.newPassword);
        if (plain !== req.body.confirmPassword)
            throw new http_1.HttpError(400, "Mật khẩu xác nhận không khớp.");
        data.password = await (0, auth_1.hashPassword)(plain);
    }
    await account_model_1.default.updateOne({ _id: id, deleted: false }, { $set: data }, { runValidators: true });
    if (data.password) {
        await (0, auth_1.revokeSessions)(id, "admin");
        await (0, auth_1.createSession)(req, res, "admin", id);
    }
    (0, http_1.success)(res, `/${config_1.systemconfig.prefixAdmin}/my-account`);
};
exports.editPatch = editPatch;
