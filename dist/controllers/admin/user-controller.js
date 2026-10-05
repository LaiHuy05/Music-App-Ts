"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.changeStatus = exports.editPatch = exports.edit = exports.detail = exports.createPost = exports.create = exports.index = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const password_reset_model_1 = __importDefault(require("../../models/password-reset.model"));
const http_1 = require("../../helpers/http");
const account_data_1 = require("../../helpers/account-data");
const auth_1 = require("../../helpers/auth");
const config_1 = require("../../config/config");
const basePath = `/${config_1.systemconfig.prefixAdmin}/users`;
const index = async (req, res) => {
    const records = await user_model_1.default.find((0, http_1.listFilter)(req, "fullName")).sort({ createdAt: -1 });
    res.render("admin/pages/accounts/index", { pageTitle: "Tài khoản user", records, roles: [], basePath, resource: "users" });
};
exports.index = index;
const create = (_req, res) => res.render("admin/pages/accounts/form", { pageTitle: "Thêm tài khoản user", record: null, roles: [], basePath, resource: "users" });
exports.create = create;
const createPost = async (req, res) => {
    await user_model_1.default.create(await (0, account_data_1.accountData)(req.body, true));
    (0, http_1.success)(res, basePath);
};
exports.createPost = createPost;
const detail = async (req, res) => {
    const record = (0, http_1.requireRecord)(await user_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    res.render("admin/pages/accounts/detail", { pageTitle: "Chi tiết tài khoản user", record, role: null, basePath, resource: "users" });
};
exports.detail = detail;
const edit = async (req, res) => {
    const record = (0, http_1.requireRecord)(await user_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    res.render("admin/pages/accounts/form", { pageTitle: "Sửa tài khoản user", record, roles: [], basePath, resource: "users" });
};
exports.edit = edit;
const editPatch = async (req, res) => {
    const id = (0, http_1.objectId)(req.params.id);
    const data = await (0, account_data_1.accountData)(req.body);
    (0, http_1.requireRecord)(await user_model_1.default.findOneAndUpdate({ _id: id, deleted: false }, { $set: data }, { returnDocument: "after", runValidators: true }));
    await (0, auth_1.revokeSessions)(id, "client");
    await password_reset_model_1.default.deleteMany({ userId: id });
    (0, http_1.success)(res, basePath);
};
exports.editPatch = editPatch;
const changeStatus = async (req, res) => {
    const id = (0, http_1.objectId)(req.params.id);
    (0, http_1.requireRecord)(await user_model_1.default.findOneAndUpdate({ _id: id, deleted: false }, { $set: { status: (0, http_1.status)(req.body.status) } }, { returnDocument: "after", runValidators: true }));
    await (0, auth_1.revokeSessions)(id, "client");
    await password_reset_model_1.default.deleteMany({ userId: id });
    (0, http_1.success)(res, basePath);
};
exports.changeStatus = changeStatus;
const deleteItem = async (req, res) => {
    const id = (0, http_1.objectId)(req.params.id);
    (0, http_1.requireRecord)(await user_model_1.default.findOneAndUpdate({ _id: id, deleted: false }, { $set: { deleted: true, deletedAt: new Date() } }));
    await (0, auth_1.revokeSessions)(id, "client");
    await password_reset_model_1.default.deleteMany({ userId: id });
    (0, http_1.success)(res, basePath, "Đã xóa tài khoản.");
};
exports.deleteItem = deleteItem;
