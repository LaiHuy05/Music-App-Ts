"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.changeStatus = exports.editPatch = exports.edit = exports.detail = exports.createPost = exports.create = exports.index = void 0;
const song_model_1 = __importDefault(require("../../models/song.model"));
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const config_1 = require("../../config/config");
const http_1 = require("../../helpers/http");
const catalog_1 = require("../../helpers/catalog");
const basePath = `/${config_1.systemconfig.prefixAdmin}/songs`;
const options = async () => ({ topics: await topic_model_1.default.find({ deleted: false }).select("title status"), singers: await singer_model_1.default.find({ deleted: false }).select("fullName status") });
const songData = async (body) => {
    const data = { ...(0, catalog_1.catalogData)(body, "title"), topicId: (0, http_1.objectId)(body.topicId), singerId: (0, http_1.objectId)(body.singerId), lyrics: (0, http_1.text)(body.lyrics, 100000) };
    if (!await topic_model_1.default.exists({ _id: data.topicId, deleted: false }) || !await singer_model_1.default.exists({ _id: data.singerId, deleted: false }))
        throw new http_1.HttpError(400, "Chủ đề hoặc ca sĩ không còn tồn tại.");
    const audio = Array.isArray(body.audio) ? body.audio[0] : body.audioUrl;
    if (audio)
        data.audio = (0, http_1.mediaUrl)(audio);
    return data;
};
const index = async (req, res) => {
    const songs = await song_model_1.default.find((0, http_1.listFilter)(req)).sort({ createdAt: -1 });
    res.render("admin/pages/songs/index", { pageTitle: "Quản lý bài hát", songs });
};
exports.index = index;
const create = async (_req, res) => res.render("admin/pages/songs/create", { pageTitle: "Thêm bài hát", ...await options() });
exports.create = create;
const createPost = async (req, res) => {
    const data = await songData(req.body);
    if (!data.audio)
        throw new http_1.HttpError(400, "Vui lòng tải lên file âm thanh hoặc nhập URL âm thanh.");
    await song_model_1.default.create(data);
    (0, http_1.success)(res, basePath);
};
exports.createPost = createPost;
const detail = async (req, res) => {
    const song = (0, http_1.requireRecord)(await song_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    song.description = (0, catalog_1.description)(song.description);
    res.render("admin/pages/songs/detail", { pageTitle: "Chi tiết bài hát", song, topic: await topic_model_1.default.findById(song.topicId), singer: await singer_model_1.default.findById(song.singerId) });
};
exports.detail = detail;
const edit = async (req, res) => {
    const song = (0, http_1.requireRecord)(await song_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    res.render("admin/pages/songs/edit", { pageTitle: "Sửa bài hát", song, ...await options() });
};
exports.edit = edit;
const editPatch = async (req, res) => {
    const song = (0, http_1.requireRecord)(await song_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    Object.assign(song, await songData(req.body));
    await song.save();
    (0, http_1.success)(res, basePath);
};
exports.editPatch = editPatch;
const changeStatus = async (req, res) => {
    (0, http_1.requireRecord)(await song_model_1.default.findOneAndUpdate({ _id: (0, http_1.objectId)(req.params.id), deleted: false }, { $set: { status: (0, http_1.status)(req.body.status) } }, { returnDocument: "after", runValidators: true }));
    (0, http_1.success)(res, basePath);
};
exports.changeStatus = changeStatus;
const deleteItem = async (req, res) => {
    (0, http_1.requireRecord)(await song_model_1.default.findOneAndUpdate({ _id: (0, http_1.objectId)(req.params.id), deleted: false }, { $set: { deleted: true, deletedAt: new Date() } }));
    (0, http_1.success)(res, basePath, "Đã xóa bài hát.");
};
exports.deleteItem = deleteItem;
