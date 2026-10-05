"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFields = exports.uploadSinger = void 0;
const uploadToCloudinary_1 = require("../../helpers/uploadToCloudinary");
const http_1 = require("../../helpers/http");
const uploadFile = async (file) => {
    if (file.mimetype.startsWith("image/") && file.size > 5 * 1024 * 1024)
        throw new http_1.HttpError(400, "Ảnh không được vượt quá 5 MB.");
    if (!process.env.CLOUD_NAME || !process.env.CLOUD_KEY || !process.env.CLOUD_SECRET)
        throw new http_1.HttpError(503, "Chưa cấu hình Cloudinary để tải tệp lên.");
    try {
        return await (0, uploadToCloudinary_1.uploadToCloudinary)(file.buffer);
    }
    catch {
        throw new http_1.HttpError(502, "Tải tệp lên thất bại. Vui lòng thử lại.");
    }
};
const uploadSinger = async (req, _res, next) => {
    if (!req.file)
        throw new http_1.HttpError(400, "Vui lòng chọn tệp.");
    req.body[req.file.fieldname] = await uploadFile(req.file);
    next();
};
exports.uploadSinger = uploadSinger;
const uploadFields = async (req, _res, next) => {
    if (req.files && !Array.isArray(req.files)) {
        for (const [field, files] of Object.entries(req.files))
            req.body[field] = await Promise.all(files.map(uploadFile));
    }
    next();
};
exports.uploadFields = uploadFields;
