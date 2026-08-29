"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_route_1 = require("./dashboard-route");
const config_1 = require("../../config/config");
const topic_route_1 = require("./topic-route");
const song_route_1 = require("./song-route");
const upload_route_1 = require("./upload-route");
const adminRoutes = (app) => {
    const PATH_ADMIN = `/${config_1.systemconfig.prefixAdmin}`;
    app.use(`${PATH_ADMIN}/dashboard`, dashboard_route_1.dashboardRoute);
    app.use(`${PATH_ADMIN}/topics`, topic_route_1.topicRoute);
    app.use(`${PATH_ADMIN}/songs`, song_route_1.songRoute);
    app.use(`${PATH_ADMIN}/upload`, upload_route_1.uploadRoute);
};
exports.default = adminRoutes;
