import { Router } from "express";
import * as controller from "../../controllers/admin/topic-controller";
import { requirePermission } from "../../middlewares/auth.middleware";
import { csrfProtection } from "../../middlewares/security.middleware";
import { imageUpload } from "../../middlewares/upload.middleware";
import { uploadFields } from "../../middlewares/admin/uploadCloud.middleware";
export const topicRoute = Router();

topicRoute.get("/", requirePermission("topics_view"), controller.index);
topicRoute.get("/create", requirePermission("topics_create"), controller.create);
topicRoute.post("/create", requirePermission("topics_create"), imageUpload.fields([{ name: "avatar", maxCount: 1 }]), csrfProtection, uploadFields, controller.createPost);
topicRoute.get("/detail/:id", requirePermission("topics_view"), controller.detail);
topicRoute.get("/edit/:id", requirePermission("topics_edit"), controller.edit);
topicRoute.patch("/edit/:id", requirePermission("topics_edit"), imageUpload.fields([{ name: "avatar", maxCount: 1 }]), csrfProtection, uploadFields, controller.editPatch);
topicRoute.patch("/status/:id", requirePermission("topics_edit"), csrfProtection, controller.changeStatus);
topicRoute.delete("/delete/:id", requirePermission("topics_delete"), csrfProtection, controller.deleteItem);
