"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const song_model_1 = __importDefault(require("../../models/song.model"));
const song_info_1 = require("../../helpers/song-info");
const index = async (_req, res) => {
    const filter = { status: "active", deleted: false };
    const fields = "title avatar singerId like listen slug createdAt";
    const [topics, liked, listened] = await Promise.all([
        topic_model_1.default.find(filter).sort({ createdAt: -1, _id: -1 }).limit(3),
        song_model_1.default.find(filter).select(fields).sort({ like: -1, _id: -1 }).limit(10),
        song_model_1.default.find(filter).select(fields).sort({ listen: -1, _id: -1 }).limit(10)
    ]);
    res.render("client/pages/home/index", { pageTitle: "Trang chủ", topics, topLiked: await (0, song_info_1.songsWithSingers)(liked), topListened: await (0, song_info_1.songsWithSingers)(listened) });
};
exports.index = index;
