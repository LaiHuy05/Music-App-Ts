"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.songUpload = exports.imageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const http_1 = require("../helpers/http");
const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const allowedAudio = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg", "audio/mp4", "audio/x-m4a"];
const makeUpload = (audio) => (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: audio ? 30 * 1024 * 1024 : 5 * 1024 * 1024, files: audio ? 2 : 1, fields: 30 },
    fileFilter: (_req, file, callback) => {
        const allowed = file.fieldname === "audio" && audio ? allowedAudio : allowedImages;
        if (!allowed.includes(file.mimetype))
            return callback(new http_1.HttpError(400, "Chỉ nhận ảnh JPG/PNG/WebP/GIF hoặc file âm thanh hợp lệ."));
        callback(null, true);
    }
});
exports.imageUpload = makeUpload(false);
exports.songUpload = makeUpload(true);
