import multer from "multer";
import { HttpError } from "../helpers/http";

const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const allowedAudio = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg", "audio/mp4", "audio/x-m4a"];
const makeUpload = (audio: boolean) => multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: audio ? 30 * 1024 * 1024 : 5 * 1024 * 1024, files: audio ? 2 : 1, fields: 30 },
  fileFilter: (_req, file, callback) => {
    const allowed = file.fieldname === "audio" && audio ? allowedAudio : allowedImages;
    if (!allowed.includes(file.mimetype)) return callback(new HttpError(400, "Chỉ nhận ảnh JPG/PNG/WebP/GIF hoặc file âm thanh hợp lệ."));
    callback(null, true);
  }
});
export const imageUpload = makeUpload(false);
export const songUpload = makeUpload(true);
