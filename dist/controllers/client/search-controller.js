"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.result = void 0;
const song_model_1 = __importDefault(require("../../models/song.model"));
const convertToSlug_1 = require("../../helpers/convertToSlug");
const song_info_1 = require("../../helpers/song-info");
const http_1 = require("../../helpers/http");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const result = async (req, res) => {
    const type = req.params.type;
    if (type !== "result" && type !== "suggest")
        throw new http_1.HttpError(404, "Không tìm thấy trang tìm kiếm.");
    const keyword = (0, http_1.text)(req.query.keyword, 100);
    const records = keyword ? await song_model_1.default.find({ status: "active", deleted: false, $or: [
            { title: new RegExp(escapeRegex(keyword), "i") }, { slug: new RegExp(escapeRegex((0, convertToSlug_1.convertToSlug)(keyword)), "i") }
        ] }).select("title avatar singerId like listen slug createdAt").limit(type === "suggest" ? 8 : 100) : [];
    const songs = await (0, song_info_1.songsWithSingers)(records);
    if (type === "suggest")
        return res.json({ code: 200, songs });
    res.render("client/pages/search/result", { pageTitle: `Kết quả: ${keyword}`, keyword, songs });
};
exports.result = result;
