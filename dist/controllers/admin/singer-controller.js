"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.changeStatus = exports.editPatch = exports.edit = exports.detail = exports.createPost = exports.create = exports.index = void 0;
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const song_model_1 = __importDefault(require("../../models/song.model"));
const config_1 = require("../../config/config");
const http_1 = require("../../helpers/http");
const catalog_1 = require("../../helpers/catalog");
const basePath = `/${config_1.systemconfig.prefixAdmin}/singers`;
const index = async (req, res) => {
    const records = await singer_model_1.default.find((0, http_1.listFilter)(req, "fullName")).sort({ createdAt: -1 });
    res.render("admin/pages/catalog/index", { pageTitle: "Quản lý ca sĩ", records, basePath, resource: "singers", nameField: "fullName" });
};
exports.index = index;
const create = (_req, res) => res.render("admin/pages/catalog/form", { pageTitle: "Thêm ca sĩ", record: null, basePath, nameField: "fullName" });
exports.create = create;
const createPost = async (req, res) => {
    const singer = new singer_model_1.default((0, catalog_1.catalogData)(req.body, "fullName"));
    singer.slug = (0, catalog_1.catalogSlug)(singer.fullName, singer.id);
    await singer.save();
    (0, http_1.success)(res, basePath);
};
exports.createPost = createPost;
const detail = async (req, res) => {
    const record = (0, http_1.requireRecord)(await singer_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    record.description = (0, catalog_1.description)(record.description);
    res.render("admin/pages/catalog/detail", { pageTitle: "Chi tiết ca sĩ", record, basePath, resource: "singers", nameField: "fullName" });
};
exports.detail = detail;
const edit = async (req, res) => {
    const record = (0, http_1.requireRecord)(await singer_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    res.render("admin/pages/catalog/form", { pageTitle: "Sửa ca sĩ", record, basePath, nameField: "fullName" });
};
exports.edit = edit;
const editPatch = async (req, res) => {
    const singer = (0, http_1.requireRecord)(await singer_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    Object.assign(singer, (0, catalog_1.catalogData)(req.body, "fullName"));
    if (!singer.slug)
        singer.slug = (0, catalog_1.catalogSlug)(singer.fullName, singer.id);
    await singer.save();
    (0, http_1.success)(res, basePath);
};
exports.editPatch = editPatch;
const changeStatus = async (req, res) => {
    (0, http_1.requireRecord)(await singer_model_1.default.findOneAndUpdate({ _id: (0, http_1.objectId)(req.params.id), deleted: false }, { $set: { status: (0, http_1.status)(req.body.status) } }, { returnDocument: "after", runValidators: true }));
    (0, http_1.success)(res, basePath);
};
exports.changeStatus = changeStatus;
const deleteItem = async (req, res) => {
    const id = (0, http_1.objectId)(req.params.id);
    if (await song_model_1.default.exists({ singerId: id, deleted: false }))
        throw new http_1.HttpError(400, "Ca sĩ đang có bài hát. Hãy chuyển hoặc xóa bài hát trước.");
    (0, http_1.requireRecord)(await singer_model_1.default.findOneAndUpdate({ _id: id, deleted: false }, { $set: { deleted: true, deletedAt: new Date() } }));
    (0, http_1.success)(res, basePath, "Đã xóa ca sĩ.");
};
exports.deleteItem = deleteItem;
