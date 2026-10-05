"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("../config/database");
const account_model_1 = __importDefault(require("../models/account.model"));
const role_model_1 = __importDefault(require("../models/role.model"));
const permissions_1 = require("../config/permissions");
const http_1 = require("../helpers/http");
const auth_1 = require("../helpers/auth");
const main = async () => {
    const adminEmail = (0, http_1.email)(process.env.ADMIN_EMAIL);
    const adminPassword = (0, http_1.password)(process.env.ADMIN_PASSWORD);
    await (0, database_1.connect)();
    const existing = await account_model_1.default.findOne({ email: adminEmail });
    if (existing) {
        if (!existing.isSuperAdmin || existing.deleted || existing.status !== "active")
            throw new Error("Email đã có tài khoản. Chọn email khác để tạo quản trị cao nhất.");
        console.log("Tài khoản quản trị đã tồn tại. Giữ nguyên thông tin và mật khẩu.");
        return;
    }
    const role = await role_model_1.default.create({ title: "Quản trị", description: "Quản lý toàn bộ ứng dụng", permissions: permissions_1.allPermissions });
    await account_model_1.default.create({ fullName: process.env.ADMIN_NAME || "Quản trị viên", email: adminEmail, password: await (0, auth_1.hashPassword)(adminPassword), roleId: role.id, isSuperAdmin: true });
    console.log("Đã tạo tài khoản quản trị. Đăng nhập tại /admin/auth/login.");
};
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose_1.default.disconnect());
