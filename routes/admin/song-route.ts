import { Router } from "express";
import multer from "multer"
const router: Router = Router();

import * as controller from "../../controllers/admin/song-controller";
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware";

const upload = multer();

router.get("/", controller.index);

router.get("/create", controller.create)

router.post("/create", upload.single("avatar"), uploadCloud.uploadSinger, controller.createPost)

export const songRoute: Router = router;