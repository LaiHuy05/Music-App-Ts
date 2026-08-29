import { Router } from "express";
import multer from "multer"
const router: Router = Router();

import * as controller from "../../controllers/admin/upload-controller";
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware";

const upload = multer();

router.post(
  "/", 
  upload.single("file"),
  uploadCloud.uploadSinger,
  controller.index
);

export const uploadRoute: Router = router;