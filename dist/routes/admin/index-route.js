"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../../config/config");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const security_middleware_1 = require("../../middlewares/security.middleware");
const dashboard_route_1 = require("./dashboard-route");
const topic_route_1 = require("./topic-route");
const song_route_1 = require("./song-route");
const singer_route_1 = require("./singer-route");
const account_route_1 = require("./account-route");
const user_route_1 = require("./user-route");
const role_route_1 = require("./role-route");
const auth_route_1 = require("./auth-route");
const upload_route_1 = require("./upload-route");
const settingController = __importStar(require("../../controllers/admin/setting-controller"));
const myAccountController = __importStar(require("../../controllers/admin/my-account-controller"));
const adminRoutes = (app) => {
    const prefix = `/${config_1.systemconfig.prefixAdmin}`;
    app.use(`${prefix}/auth`, auth_route_1.authRoute);
    const router = (0, express_1.Router)();
    router.use(auth_middleware_1.requireAdmin);
    router.get("/", (_req, res) => res.redirect(`${prefix}/${res.locals.can("dashboard_view") ? "dashboard" : "my-account"}`));
    router.use("/dashboard", (0, auth_middleware_1.requirePermission)("dashboard_view"), dashboard_route_1.dashboardRoute);
    router.use("/topics", topic_route_1.topicRoute);
    router.use("/songs", song_route_1.songRoute);
    router.use("/singers", singer_route_1.singerRoute);
    router.use("/accounts", account_route_1.accountRoute);
    router.use("/users", user_route_1.userRoute);
    router.use("/roles", role_route_1.roleRoute);
    router.use("/upload", upload_route_1.uploadRoute);
    router.get("/settings/general", (0, auth_middleware_1.requirePermission)("settings_view"), settingController.general);
    router.patch("/settings/general", (0, auth_middleware_1.requirePermission)("settings_edit"), security_middleware_1.csrfProtection, settingController.generalPatch);
    router.get("/my-account", myAccountController.index);
    router.patch("/my-account", security_middleware_1.csrfProtection, myAccountController.editPatch);
    app.use(prefix, router);
};
exports.default = adminRoutes;
