"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const song_model_1 = __importDefault(require("../../models/song.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const account_model_1 = __importDefault(require("../../models/account.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const index = async (_req, res) => {
    const [topics, songs, singers, accounts, users, totals, recentSongs] = await Promise.all([
        topic_model_1.default.countDocuments({ deleted: false }), song_model_1.default.countDocuments({ deleted: false }),
        singer_model_1.default.countDocuments({ deleted: false }), account_model_1.default.countDocuments({ deleted: false }),
        user_model_1.default.countDocuments({ deleted: false }),
        song_model_1.default.aggregate([{ $match: { deleted: false } }, { $group: { _id: null, like: { $sum: "$like" }, listen: { $sum: "$listen" } } }]),
        song_model_1.default.find({ deleted: false }).sort({ createdAt: -1 }).limit(5)
    ]);
    res.render("admin/pages/dashboard/index", { pageTitle: "Trang tổng quan", stats: { topics, songs, singers, accounts, users, like: totals[0]?.like || 0, listen: totals[0]?.listen || 0 }, recentSongs });
};
exports.index = index;
