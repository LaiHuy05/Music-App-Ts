import { Router } from "express";
import * as controller from "../../controllers/admin/user-controller";
import { requirePermission } from "../../middlewares/auth.middleware";
import { csrfProtection } from "../../middlewares/security.middleware";

export const userRoute = Router();
userRoute.use(csrfProtection);
userRoute.get("/", requirePermission("users_view"), controller.index);
userRoute.get("/create", requirePermission("users_create"), controller.create);
userRoute.post("/create", requirePermission("users_create"), controller.createPost);
userRoute.get("/detail/:id", requirePermission("users_view"), controller.detail);
userRoute.get("/edit/:id", requirePermission("users_edit"), controller.edit);
userRoute.patch("/edit/:id", requirePermission("users_edit"), controller.editPatch);
userRoute.patch("/status/:id", requirePermission("users_edit"), csrfProtection, controller.changeStatus);
userRoute.delete("/delete/:id", requirePermission("users_delete"), csrfProtection, controller.deleteItem);
