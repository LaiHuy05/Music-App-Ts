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
exports.uploadRoute = void 0;
const express_1 = require("express");
const controller = __importStar(require("../../controllers/admin/upload-controller"));
const uploadCloud_middleware_1 = require("../../middlewares/admin/uploadCloud.middleware");
const upload_middleware_1 = require("../../middlewares/upload.middleware");
const security_middleware_1 = require("../../middlewares/security.middleware");
const http_1 = require("../../helpers/http");
exports.uploadRoute = (0, express_1.Router)();
exports.uploadRoute.post("/", (_req, res, next) => {
    const resources = ["songs", "topics", "singers"];
    if (!resources.some(resource => res.locals.can(`${resource}_create`) || res.locals.can(`${resource}_edit`)))
        throw new http_1.HttpError(403, "Bạn không có quyền tải lên ảnh.");
    next();
}, upload_middleware_1.imageUpload.single("file"), security_middleware_1.csrfProtection, uploadCloud_middleware_1.uploadSinger, controller.index);
