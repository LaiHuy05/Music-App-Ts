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
exports.userRoute = void 0;
const express_1 = require("express");
const controller = __importStar(require("../../controllers/admin/user-controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const security_middleware_1 = require("../../middlewares/security.middleware");
exports.userRoute = (0, express_1.Router)();
exports.userRoute.use(security_middleware_1.csrfProtection);
exports.userRoute.get("/", (0, auth_middleware_1.requirePermission)("users_view"), controller.index);
exports.userRoute.get("/create", (0, auth_middleware_1.requirePermission)("users_create"), controller.create);
exports.userRoute.post("/create", (0, auth_middleware_1.requirePermission)("users_create"), controller.createPost);
exports.userRoute.get("/detail/:id", (0, auth_middleware_1.requirePermission)("users_view"), controller.detail);
exports.userRoute.get("/edit/:id", (0, auth_middleware_1.requirePermission)("users_edit"), controller.edit);
exports.userRoute.patch("/edit/:id", (0, auth_middleware_1.requirePermission)("users_edit"), controller.editPatch);
exports.userRoute.patch("/status/:id", (0, auth_middleware_1.requirePermission)("users_edit"), security_middleware_1.csrfProtection, controller.changeStatus);
exports.userRoute.delete("/delete/:id", (0, auth_middleware_1.requirePermission)("users_delete"), security_middleware_1.csrfProtection, controller.deleteItem);
