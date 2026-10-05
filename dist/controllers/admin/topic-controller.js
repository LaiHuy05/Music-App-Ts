"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.changeStatus = exports.editPatch = exports.edit = exports.detail = exports.createPost = exports.create = exports.index = void 0;
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const song_model_1 = __importDefault(require("../../models/song.model"));
const config_1 = require("../../config/config");
const http_1 = require("../../helpers/http");
const catalog_1 = require("../../helpers/catalog");
const basePath = `/${config_1.systemconfig.prefixAdmin}/topics`;
const index = async (req, res) => {
    const records = await topic_model_1.default.find((0, http_1.listFilter)(req)).sort({ createdAt: -1 });
    res.render("admin/pages/catalog/index", { pageTitle: "Quản lý chủ đề", records, basePath, resource: "topics", nameField: "title" });
};
exports.index = index;
const create = (_req, res) => res.render("admin/pages/catalog/form", { pageTitle: "Thêm chủ đề", record: null, basePath, nameField: "title" });
exports.create = create;
const createPost = async (req, res) => {
    const topic = new topic_model_1.default((0, catalog_1.catalogData)(req.body, "title"));
    topic.slug = (0, catalog_1.catalogSlug)(topic.title, topic.id);
    await topic.save();
    (0, http_1.success)(res, basePath);
};
exports.createPost = createPost;
const detail = async (req, res) => {
    const record = (0, http_1.requireRecord)(await topic_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    record.description = (0, catalog_1.description)(record.description);
    res.render("admin/pages/catalog/detail", { pageTitle: "Chi tiết chủ đề", record, basePath, resource: "topics", nameField: "title" });
};
exports.detail = detail;
const edit = async (req, res) => {
    const record = (0, http_1.requireRecord)(await topic_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    res.render("admin/pages/catalog/form", { pageTitle: "Sửa chủ đề", record, basePath, nameField: "title" });
};
exports.edit = edit;
const editPatch = async (req, res) => {
    const topic = (0, http_1.requireRecord)(await topic_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    Object.assign(topic, (0, catalog_1.catalogData)(req.body, "title"));
    if (!topic.slug)
        topic.slug = (0, catalog_1.catalogSlug)(topic.title, topic.id);
    await topic.save();
    (0, http_1.success)(res, basePath);
};
exports.editPatch = editPatch;
const changeStatus = async (req, res) => {
    (0, http_1.requireRecord)(await topic_model_1.default.findOneAndUpdate({ _id: (0, http_1.objectId)(req.params.id), deleted: false }, { $set: { status: (0, http_1.status)(req.body.status) } }, { returnDocument: "after", runValidators: true }));
    (0, http_1.success)(res, basePath);
};
exports.changeStatus = changeStatus;
const deleteItem = async (req, res) => {
    const id = (0, http_1.objectId)(req.params.id);
    if (await song_model_1.default.exists({ topicId: id, deleted: false }))
        throw new http_1.HttpError(400, "Chủ đề đang có bài hát. Hãy chuyển hoặc xóa bài hát trước.");
    (0, http_1.requireRecord)(await topic_model_1.default.findOneAndUpdate({ _id: id, deleted: false }, { $set: { deleted: true, deletedAt: new Date() } }));
    (0, http_1.success)(res, basePath, "Đã xóa chủ đề.");
};
exports.deleteItem = deleteItem;
