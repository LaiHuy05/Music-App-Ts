import express, { Express, Request, Response, NextFunction } from "express";
import methodOverride from "method-override";
import path from "path";
import { connect } from "./config/database";
import { systemconfig } from "./config/config";
import clientRoutes from "./routes/client/index-route";
import adminRoutes from "./routes/admin/index-route";
import { loadAuth } from "./middlewares/auth.middleware";
import { csrfLocals, csrfProtection, securityHeaders } from "./middlewares/security.middleware";
import { HttpError, isJsonRequest, safeNext, text } from "./helpers/http";
import SettingGeneral from "./models/setting-general.model";

export const createApp = (connectDatabase = true): Express => {
  const app = express();
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY));
  app.use(securityHeaders);
  app.use(express.static(path.join(__dirname, "public")));
  app.use("/vendor/bootstrap", express.static(path.join(path.dirname(require.resolve("bootstrap/package.json")), "dist")));
  app.use("/vendor/jquery", express.static(path.join(path.dirname(require.resolve("jquery/package.json")), "dist")));
  app.use("/vendor/aplayer", express.static(path.join(path.dirname(require.resolve("aplayer/package.json")), "dist")));
  app.use("/vendor/fontawesome", express.static(path.dirname(require.resolve("@fortawesome/fontawesome-free/package.json"))));
  app.use("/tinymce", express.static(path.join(__dirname, "../node_modules/tinymce")));
  app.use("/tinymce", express.static(path.join(__dirname, "node_modules/tinymce")));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(methodOverride("_method"));
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "pug");
  app.locals.prefixAdmin = systemconfig.prefixAdmin;
  if (connectDatabase) app.use(async (_req, _res, next) => { await connect(); next(); });
  app.use(csrfLocals);
  // Multipart routes check CSRF after multer parses the form, before upload/write.
  app.use((req, res, next) => req.is("multipart/form-data") ? next() : csrfProtection(req, res, next));
  app.use(loadAuth);
  app.use(async (req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.locals.message = text(req.query.message, 400);
    res.locals.keyword = text(req.query.keyword, 100);
    res.locals.selectedStatus = text(req.query.status, 20);
    res.locals.settings = await SettingGeneral.findOne({ key: "general" }).lean() || { websiteName: "Music App", logo: "/images/logo.png", description: "Nghe nhạc và lưu bài hát bạn yêu thích.", copyright: "Copyright © 2026 Music App." };
    next();
  });
  clientRoutes(app);
  adminRoutes(app);
  app.use((_req, _res, next) => next(new HttpError(404, "Không tìm thấy trang.")));
  app.use((error: any, req: Request, res: Response, _next: NextFunction) => {
    let status = error.status || 500;
    let message = error instanceof HttpError ? error.message : "Có lỗi xảy ra. Vui lòng thử lại.";
    if (error.code === 11000) { status = 409; message = "Email hoặc dữ liệu này đã tồn tại."; }
    if (error.name === "ValidationError" || error.name === "CastError") { status = 400; message = "Dữ liệu nhập không hợp lệ."; }
    if (error.name === "MulterError") { status = 400; message = "Tệp quá lớn hoặc không đúng trường tải lên."; }
    if (error.type === "entity.parse.failed") { status = 400; message = "Dữ liệu gửi lên không hợp lệ."; }
    if (status >= 500) console.error("Request failed:", error.name || "Error");
    if (isJsonRequest(req)) return res.status(status).json({ code: status, message });
    res.status(status).render("shared/error", { pageTitle: "Thông báo", message, back: safeNext(req.get("referer")?.replace(/^https?:\/\/[^/]+/, "")) });
  });
  return app;
};
