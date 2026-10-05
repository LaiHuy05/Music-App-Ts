import { Router } from "express";
import * as controller from "../../controllers/admin/upload-controller";
import { uploadSinger } from "../../middlewares/admin/uploadCloud.middleware";
import { imageUpload } from "../../middlewares/upload.middleware";
import { csrfProtection } from "../../middlewares/security.middleware";
import { HttpError } from "../../helpers/http";

export const uploadRoute = Router();
uploadRoute.post("/", (_req, res, next) => {
  const resources = ["songs", "topics", "singers"];
  if (!resources.some(resource => res.locals.can(`${resource}_create`) || res.locals.can(`${resource}_edit`))) throw new HttpError(403, "Bạn không có quyền tải lên ảnh.");
  next();
}, imageUpload.single("file"), csrfProtection, uploadSinger, controller.index);
