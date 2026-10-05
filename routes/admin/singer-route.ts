import { Router } from "express";
import * as controller from "../../controllers/admin/singer-controller";
import { requirePermission } from "../../middlewares/auth.middleware";
import { csrfProtection } from "../../middlewares/security.middleware";
import { imageUpload } from "../../middlewares/upload.middleware";
import { uploadFields } from "../../middlewares/admin/uploadCloud.middleware";
export const singerRoute = Router();

singerRoute.get("/", requirePermission("singers_view"), controller.index);
singerRoute.get("/create", requirePermission("singers_create"), controller.create);
singerRoute.post("/create", requirePermission("singers_create"), imageUpload.fields([{ name: "avatar", maxCount: 1 }]), csrfProtection, uploadFields, controller.createPost);
singerRoute.get("/detail/:id", requirePermission("singers_view"), controller.detail);
singerRoute.get("/edit/:id", requirePermission("singers_edit"), controller.edit);
singerRoute.patch("/edit/:id", requirePermission("singers_edit"), imageUpload.fields([{ name: "avatar", maxCount: 1 }]), csrfProtection, uploadFields, controller.editPatch);
singerRoute.patch("/status/:id", requirePermission("singers_edit"), csrfProtection, controller.changeStatus);
singerRoute.delete("/delete/:id", requirePermission("singers_delete"), csrfProtection, controller.deleteItem);
