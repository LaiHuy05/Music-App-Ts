"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listen = exports.favorite = exports.like = exports.detail = exports.list = void 0;
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const song_model_1 = __importDefault(require("../../models/song.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const favorite_song_model_1 = __importDefault(require("../../models/favorite-song.model"));
const http_1 = require("../../helpers/http");
const song_info_1 = require("../../helpers/song-info");
const catalog_1 = require("../../helpers/catalog");
const list = async (req, res) => {
    const topic = (0, http_1.requireRecord)(await topic_model_1.default.findOne({ slug: req.params.slugTopic, status: "active", deleted: false }), "Chủ đề không tồn tại.");
    const songs = await song_model_1.default.find({ topicId: topic.id, status: "active", deleted: false }).select("title avatar singerId like listen slug createdAt");
    res.render("client/pages/songs/list", { pageTitle: topic.title, songs: await (0, song_info_1.songsWithSingers)(songs) });
};
exports.list = list;
const detail = async (req, res) => {
    const record = (0, http_1.requireRecord)(await song_model_1.default.findOne({ slug: req.params.slugSong, status: "active", deleted: false }).select("+likedBy"), "Bài hát không tồn tại.");
    const singer = await singer_model_1.default.findOne({ _id: record.singerId, deleted: false, status: "active" }).select("fullName") || { fullName: "Chưa cập nhật ca sĩ" };
    const topic = await topic_model_1.default.findOne({ _id: record.topicId, deleted: false, status: "active" }).select("title") || { title: "Chưa cập nhật chủ đề" };
    const userId = res.locals.currentUser?.id;
    const favorite = userId ? await favorite_song_model_1.default.exists({ userId, songId: record.id, deleted: false }) : null;
    const song = { ...record.toObject(), id: record.id, isFavoriteSong: !!favorite, isLiked: !!userId && record.likedBy.includes(userId) };
    delete song.likedBy;
    song.description = (0, catalog_1.description)(song.description);
    res.render("client/pages/songs/detail", { pageTitle: song.title, song, singer, topic });
};
exports.detail = detail;
const like = async (req, res) => {
    const id = (0, http_1.objectId)(req.params.idSong);
    const userId = res.locals.currentUser.id;
    const action = req.params.typeLike;
    if (action !== "like" && action !== "dislike")
        throw new http_1.HttpError(400, "Thao tác thích không hợp lệ.");
    const filter = { _id: id, status: "active", deleted: false };
    if (action === "like") {
        await song_model_1.default.updateOne({ ...filter, likedBy: { $ne: userId } }, { $addToSet: { likedBy: userId }, $inc: { like: 1 } });
    }
    else {
        await song_model_1.default.updateOne({ ...filter, likedBy: userId }, [{ $set: {
                    likedBy: { $setDifference: [{ $ifNull: ["$likedBy", []] }, [userId]] },
                    like: { $max: [0, { $subtract: [{ $ifNull: ["$like", 0] }, 1] }] }
                } }], { updatePipeline: true });
    }
    const song = (0, http_1.requireRecord)(await song_model_1.default.findOne(filter).select("like +likedBy"), "Bài hát không tồn tại.");
    res.json({ code: 200, message: "Cập nhật lượt thích thành công.", like: song.like, isLiked: song.likedBy.includes(userId) });
};
exports.like = like;
const favorite = async (req, res) => {
    const songId = (0, http_1.objectId)(req.params.idSong);
    const userId = res.locals.currentUser.id;
    (0, http_1.requireRecord)(await song_model_1.default.exists({ _id: songId, status: "active", deleted: false }), "Bài hát không tồn tại.");
    if (req.params.typeFavorite === "favorite") {
        try {
            await favorite_song_model_1.default.findOneAndUpdate({ userId, songId }, { $set: { deleted: false } }, { upsert: true, runValidators: true });
        }
        catch (error) {
            if (error.code !== 11000)
                throw error;
        }
    }
    else if (req.params.typeFavorite === "unfavorite")
        await favorite_song_model_1.default.deleteOne({ userId, songId });
    else
        throw new http_1.HttpError(400, "Thao tác yêu thích không hợp lệ.");
    res.json({ code: 200, message: "Cập nhật yêu thích thành công.", isFavorite: req.params.typeFavorite === "favorite" });
};
exports.favorite = favorite;
const listen = async (req, res) => {
    const song = (0, http_1.requireRecord)(await song_model_1.default.findOneAndUpdate({ _id: (0, http_1.objectId)(req.params.idSong), status: "active", deleted: false }, { $inc: { listen: 1 } }, { returnDocument: "after" }).select("listen"), "Bài hát không tồn tại.");
    res.json({ code: 200, message: "Đã cập nhật lượt nghe.", listen: song.listen });
};
exports.listen = listen;
