"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const controller = __importStar(require("../../controllers/client/user-controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const security_middleware_1 = require("../../middlewares/security.middleware");
const upload_middleware_1 = require("../../middlewares/upload.middleware");
const uploadCloud_middleware_1 = require("../../middlewares/admin/uploadCloud.middleware");
exports.userRoutes = (0, express_1.Router)();
exports.userRoutes.get("/login", controller.login);
exports.userRoutes.post("/login", security_middleware_1.csrfProtection, (0, security_middleware_1.authRateLimit)("client-login"), controller.loginPost);
exports.userRoutes.get("/register", controller.register);
exports.userRoutes.post("/register", security_middleware_1.csrfProtection, (0, security_middleware_1.authRateLimit)("register", 10), controller.registerPost);
exports.userRoutes.post("/logout", security_middleware_1.csrfProtection, controller.logout);
exports.userRoutes.get("/password/forgot", controller.forgotPassword);
exports.userRoutes.post("/password/forgot", security_middleware_1.csrfProtection, (0, security_middleware_1.authRateLimit)("forgot-password", 5), controller.forgotPasswordPost);
exports.userRoutes.get("/password/reset/:token", controller.resetPassword);
exports.userRoutes.post("/password/reset/:token", security_middleware_1.csrfProtection, (0, security_middleware_1.authRateLimit)("reset-password"), controller.resetPasswordPost);
exports.userRoutes.get("/info", auth_middleware_1.requireUser, controller.info);
exports.userRoutes.patch("/info", auth_middleware_1.requireUser, upload_middleware_1.imageUpload.fields([{ name: "avatar", maxCount: 1 }]), security_middleware_1.csrfProtection, uploadCloud_middleware_1.uploadFields, controller.infoPatch);
