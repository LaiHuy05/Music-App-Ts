import { Router } from "express";
import * as controller from "../../controllers/client/user-controller";
import { requireUser } from "../../middlewares/auth.middleware";
import { authRateLimit, csrfProtection } from "../../middlewares/security.middleware";
import { imageUpload } from "../../middlewares/upload.middleware";
import { uploadFields } from "../../middlewares/admin/uploadCloud.middleware";

export const userRoutes = Router();
userRoutes.get("/login", controller.login);
userRoutes.post("/login", csrfProtection, authRateLimit("client-login"), controller.loginPost);
userRoutes.get("/register", controller.register);
userRoutes.post("/register", csrfProtection, authRateLimit("register", 10), controller.registerPost);
userRoutes.post("/logout", csrfProtection, controller.logout);
userRoutes.get("/password/forgot", controller.forgotPassword);
userRoutes.post("/password/forgot", csrfProtection, authRateLimit("forgot-password", 5), controller.forgotPasswordPost);
userRoutes.get("/password/reset/:token", controller.resetPassword);
userRoutes.post("/password/reset/:token", csrfProtection, authRateLimit("reset-password"), controller.resetPasswordPost);
userRoutes.get("/info", requireUser, controller.info);
userRoutes.patch("/info", requireUser, imageUpload.fields([{ name: "avatar", maxCount: 1 }]), csrfProtection, uploadFields, controller.infoPatch);
