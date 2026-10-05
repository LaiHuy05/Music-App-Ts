import { Router } from "express";
import * as controller from "../../controllers/admin/auth-controller";
import { authRateLimit, csrfProtection } from "../../middlewares/security.middleware";

export const authRoute = Router();
authRoute.use(csrfProtection);
authRoute.get("/login", controller.login);
authRoute.post("/login", authRateLimit("admin-login"), controller.loginPost);
authRoute.post("/logout", controller.logout);
