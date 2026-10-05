import { Router } from "express";
import * as controller from "../../controllers/admin/account-controller";
import { requirePermission } from "../../middlewares/auth.middleware";
import { csrfProtection } from "../../middlewares/security.middleware";

export const accountRoute = Router();
accountRoute.use(csrfProtection);
accountRoute.get("/", requirePermission("accounts_view"), controller.index);
accountRoute.get("/create", requirePermission("accounts_create"), controller.create);
accountRoute.post("/create", requirePermission("accounts_create"), controller.createPost);
accountRoute.get("/detail/:id", requirePermission("accounts_view"), controller.detail);
accountRoute.get("/edit/:id", requirePermission("accounts_edit"), controller.edit);
accountRoute.patch("/edit/:id", requirePermission("accounts_edit"), controller.editPatch);
accountRoute.patch("/status/:id", requirePermission("accounts_edit"), csrfProtection, controller.changeStatus);
accountRoute.delete("/delete/:id", requirePermission("accounts_delete"), csrfProtection, controller.deleteItem);
