"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const method_override_1 = __importDefault(require("method-override"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./config/database");
const config_1 = require("./config/config");
const index_route_1 = __importDefault(require("./routes/client/index-route"));
const index_route_2 = __importDefault(require("./routes/admin/index-route"));
const auth_middleware_1 = require("./middlewares/auth.middleware");
const security_middleware_1 = require("./middlewares/security.middleware");
const http_1 = require("./helpers/http");
const setting_general_model_1 = __importDefault(require("./models/setting-general.model"));
const createApp = (connectDatabase = true) => {
    const app = (0, express_1.default)();
    app.disable("x-powered-by");
    if (process.env.TRUST_PROXY)
        app.set("trust proxy", Number(process.env.TRUST_PROXY));
    app.use(security_middleware_1.securityHeaders);
    app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
    app.use("/vendor/bootstrap", express_1.default.static(path_1.default.join(path_1.default.dirname(require.resolve("bootstrap/package.json")), "dist")));
    app.use("/vendor/jquery", express_1.default.static(path_1.default.join(path_1.default.dirname(require.resolve("jquery/package.json")), "dist")));
    app.use("/vendor/aplayer", express_1.default.static(path_1.default.join(path_1.default.dirname(require.resolve("aplayer/package.json")), "dist")));
    app.use("/vendor/fontawesome", express_1.default.static(path_1.default.dirname(require.resolve("@fortawesome/fontawesome-free/package.json"))));
    app.use("/tinymce", express_1.default.static(path_1.default.join(__dirname, "../node_modules/tinymce")));
    app.use("/tinymce", express_1.default.static(path_1.default.join(__dirname, "node_modules/tinymce")));
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "1mb" }));
    app.use((0, method_override_1.default)("_method"));
    app.set("views", path_1.default.join(__dirname, "views"));
    app.set("view engine", "pug");
    app.locals.prefixAdmin = config_1.systemconfig.prefixAdmin;
    if (connectDatabase)
        app.use(async (_req, _res, next) => { await (0, database_1.connect)(); next(); });
    app.use(security_middleware_1.csrfLocals);
    app.use((req, res, next) => req.is("multipart/form-data") ? next() : (0, security_middleware_1.csrfProtection)(req, res, next));
    app.use(auth_middleware_1.loadAuth);
    app.use(async (req, res, next) => {
        res.set("Cache-Control", "no-store");
        res.locals.message = (0, http_1.text)(req.query.message, 400);
        res.locals.keyword = (0, http_1.text)(req.query.keyword, 100);
        res.locals.selectedStatus = (0, http_1.text)(req.query.status, 20);
        res.locals.settings = await setting_general_model_1.default.findOne({ key: "general" }).lean() || { websiteName: "Music App", logo: "/images/logo.png", description: "Nghe nhạc và lưu bài hát bạn yêu thích.", copyright: "Copyright © 2026 Music App." };
        next();
    });
    (0, index_route_1.default)(app);
    (0, index_route_2.default)(app);
    app.use((_req, _res, next) => next(new http_1.HttpError(404, "Không tìm thấy trang.")));
    app.use((error, req, res, _next) => {
        let status = error.status || 500;
        let message = error instanceof http_1.HttpError ? error.message : "Có lỗi xảy ra. Vui lòng thử lại.";
        if (error.code === 11000) {
            status = 409;
            message = "Email hoặc dữ liệu này đã tồn tại.";
        }
        if (error.name === "ValidationError" || error.name === "CastError") {
            status = 400;
            message = "Dữ liệu nhập không hợp lệ.";
        }
        if (error.name === "MulterError") {
            status = 400;
            message = "Tệp quá lớn hoặc không đúng trường tải lên.";
        }
        if (error.type === "entity.parse.failed") {
            status = 400;
            message = "Dữ liệu gửi lên không hợp lệ.";
        }
        if (status >= 500)
            console.error("Request failed:", error.name || "Error");
        if ((0, http_1.isJsonRequest)(req))
            return res.status(status).json({ code: status, message });
        res.status(status).render("shared/error", { pageTitle: "Thông báo", message, back: (0, http_1.safeNext)(req.get("referer")?.replace(/^https?:\/\/[^/]+/, "")) });
    });
    return app;
};
exports.createApp = createApp;
