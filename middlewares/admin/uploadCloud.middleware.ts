import { Request, Response, NextFunction } from "express";
import { uploadToCloudinary } from "../../helpers/uploadToCloudinary";
import { HttpError } from "../../helpers/http";

const uploadFile = async (file: Express.Multer.File) => {
  if (file.mimetype.startsWith("image/") && file.size > 5 * 1024 * 1024) throw new HttpError(400, "Ảnh không được vượt quá 5 MB.");
  if (!process.env.CLOUD_NAME || !process.env.CLOUD_KEY || !process.env.CLOUD_SECRET) throw new HttpError(503, "Chưa cấu hình Cloudinary để tải tệp lên.");
  try { return await uploadToCloudinary(file.buffer); }
  catch { throw new HttpError(502, "Tải tệp lên thất bại. Vui lòng thử lại."); }
};
export const uploadSinger = async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.file) throw new HttpError(400, "Vui lòng chọn tệp.");
  req.body[req.file.fieldname] = await uploadFile(req.file);
  next();
};
export const uploadFields = async (req: Request, _res: Response, next: NextFunction) => {
  if (req.files && !Array.isArray(req.files)) {
    for (const [field, files] of Object.entries(req.files)) req.body[field] = await Promise.all(files.map(uploadFile));
  }
  next();
};
