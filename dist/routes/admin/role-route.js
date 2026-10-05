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
exports.roleRoute = void 0;
const express_1 = require("express");
const controller = __importStar(require("../../controllers/admin/role-controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const security_middleware_1 = require("../../middlewares/security.middleware");
exports.roleRoute = (0, express_1.Router)();
exports.roleRoute.use(security_middleware_1.csrfProtection);
exports.roleRoute.get("/", (0, auth_middleware_1.requirePermission)("roles_view"), controller.index);
exports.roleRoute.get("/permissions", (0, auth_middleware_1.requirePermission)("roles_view"), controller.permissions);
exports.roleRoute.patch("/permissions", (0, auth_middleware_1.requirePermission)("roles_edit"), controller.permissionsPatch);
exports.roleRoute.get("/create", (0, auth_middleware_1.requirePermission)("roles_create"), controller.create);
exports.roleRoute.post("/create", (0, auth_middleware_1.requirePermission)("roles_create"), controller.createPost);
exports.roleRoute.get("/edit/:id", (0, auth_middleware_1.requirePermission)("roles_edit"), controller.edit);
exports.roleRoute.patch("/edit/:id", (0, auth_middleware_1.requirePermission)("roles_edit"), controller.editPatch);
exports.roleRoute.delete("/delete/:id", (0, auth_middleware_1.requirePermission)("roles_delete"), controller.deleteItem);
