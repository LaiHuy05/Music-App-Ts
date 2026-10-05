import { Router } from "express";
import * as controller from "../../controllers/admin/song-controller";
import { requirePermission } from "../../middlewares/auth.middleware";
import { csrfProtection } from "../../middlewares/security.middleware";
import { songUpload } from "../../middlewares/upload.middleware";
import { uploadFields } from "../../middlewares/admin/uploadCloud.middleware";
export const songRoute = Router();

songRoute.get("/", requirePermission("songs_view"), controller.index);
songRoute.get("/create", requirePermission("songs_create"), controller.create);
songRoute.post("/create", requirePermission("songs_create"), songUpload.fields([{ name: "avatar", maxCount: 1 }, { name: "audio", maxCount: 1 }]), csrfProtection, uploadFields, controller.createPost);
songRoute.get("/detail/:id", requirePermission("songs_view"), controller.detail);
songRoute.get("/edit/:id", requirePermission("songs_edit"), controller.edit);
songRoute.patch("/edit/:id", requirePermission("songs_edit"), songUpload.fields([{ name: "avatar", maxCount: 1 }, { name: "audio", maxCount: 1 }]), csrfProtection, uploadFields, controller.editPatch);
songRoute.patch("/status/:id", requirePermission("songs_edit"), csrfProtection, controller.changeStatus);
songRoute.delete("/delete/:id", requirePermission("songs_delete"), csrfProtection, controller.deleteItem);
