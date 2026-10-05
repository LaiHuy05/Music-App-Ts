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
const topic_route_1 = require("./topic-route");
const song_route_1 = require("./song-route");
const favorite_song_route_1 = require("./favorite-song-route");
const search_route_1 = require("./search-route");
const user_route_1 = require("./user-route");
const homeController = __importStar(require("../../controllers/client/home-controller"));
const clientRoutes = (app) => {
    app.get("/", homeController.index);
    app.use("/user", user_route_1.userRoutes);
    app.use("/topics", topic_route_1.topicRoute);
    app.use("/songs", song_route_1.songRoutes);
    app.use("/favorite-songs", favorite_song_route_1.favoriteSongRoutes);
    app.use("/search", search_route_1.searchRoutes);
};
exports.default = clientRoutes;
