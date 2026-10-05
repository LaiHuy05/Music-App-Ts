"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_route_1 = require("./dashboard-route");
const config_1 = require("../../config/config");
const topic_route_1 = require("./topic-route");
const song_route_1 = require("./song-route");
const upload_route_1 = require("./upload-route");
const auth_route_1 = require("./auth-route");
const auth_middleware_1 = require("../../middlewares/admin/auth.middleware");
const adminRoutes = (app) => {
    const PATH_ADMIN = `/${config_1.systemconfig.prefixAdmin}`;
    app.use(`${PATH_ADMIN}/auth`, auth_route_1.authRoute);
    app.use(`${PATH_ADMIN}/dashboard`, auth_middleware_1.requireAuth, dashboard_route_1.dashboardRoute);
    app.use(`${PATH_ADMIN}/topics`, auth_middleware_1.requireAuth, topic_route_1.topicRoute);
    app.use(`${PATH_ADMIN}/songs`, auth_middleware_1.requireAuth, song_route_1.songRoute);
    app.use(`${PATH_ADMIN}/upload`, auth_middleware_1.requireAuth, upload_route_1.uploadRoute);
};
exports.default = adminRoutes;
