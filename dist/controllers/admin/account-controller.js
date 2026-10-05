"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.changeStatus = exports.editPatch = exports.edit = exports.detail = exports.createPost = exports.create = exports.index = void 0;
const account_model_1 = __importDefault(require("../../models/account.model"));
const role_model_1 = __importDefault(require("../../models/role.model"));
const http_1 = require("../../helpers/http");
const account_data_1 = require("../../helpers/account-data");
const auth_1 = require("../../helpers/auth");
const config_1 = require("../../config/config");
const basePath = `/${config_1.systemconfig.prefixAdmin}/accounts`;
const roles = () => role_model_1.default.find({ deleted: false, status: "active" });
const validRole = async (id) => (0, http_1.requireRecord)(await role_model_1.default.findOne({ _id: (0, http_1.objectId)(id), deleted: false, status: "active" }), "Nhóm quyền không tồn tại hoặc đã bị khóa.").id;
const editable = (record, res) => {
    if (record.isSuperAdmin && record.id !== res.locals.currentAdmin.id)
        throw new http_1.HttpError(403, "Không thể sửa tài khoản quản trị cao nhất của người khác.");
};
const index = async (req, res) => {
    const records = await account_model_1.default.find((0, http_1.listFilter)(req, "fullName")).sort({ createdAt: -1 });
    res.render("admin/pages/accounts/index", { pageTitle: "Tài khoản admin", records, roles: await role_model_1.default.find({ deleted: false }), basePath, resource: "accounts" });
};
exports.index = index;
const create = async (_req, res) => res.render("admin/pages/accounts/form", { pageTitle: "Thêm tài khoản admin", record: null, roles: await roles(), basePath, resource: "accounts" });
exports.create = create;
const createPost = async (req, res) => {
    await account_model_1.default.create({ ...await (0, account_data_1.accountData)(req.body, true), roleId: await validRole(req.body.roleId) });
    (0, http_1.success)(res, basePath);
};
exports.createPost = createPost;
const detail = async (req, res) => {
    const record = (0, http_1.requireRecord)(await account_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    res.render("admin/pages/accounts/detail", { pageTitle: "Chi tiết tài khoản admin", record, role: record.roleId ? await role_model_1.default.findById(record.roleId) : null, basePath, resource: "accounts" });
};
exports.detail = detail;
const edit = async (req, res) => {
    const record = (0, http_1.requireRecord)(await account_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    editable(record, res);
    res.render("admin/pages/accounts/form", { pageTitle: "Sửa tài khoản admin", record, roles: await roles(), basePath, resource: "accounts" });
};
exports.edit = edit;
const editPatch = async (req, res) => {
    const record = (0, http_1.requireRecord)(await account_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    editable(record, res);
    const data = await (0, account_data_1.accountData)(req.body);
    data.roleId = record.isSuperAdmin ? record.roleId : await validRole(req.body.roleId);
    if (record.id === res.locals.currentAdmin.id && (data.status !== "active" || data.roleId !== record.roleId))
        throw new http_1.HttpError(400, "Không thể tự khóa hoặc thay đổi nhóm quyền của chính mình.");
    if (record.isSuperAdmin && data.status !== "active")
        throw new http_1.HttpError(400, "Không thể khóa tài khoản quản trị cao nhất.");
    await account_model_1.default.updateOne({ _id: record.id }, { $set: data }, { runValidators: true });
    await (0, auth_1.revokeSessions)(record.id, "admin");
    if (record.id === res.locals.currentAdmin.id)
        await (0, auth_1.createSession)(req, res, "admin", record.id);
    (0, http_1.success)(res, basePath);
};
exports.editPatch = editPatch;
const changeStatus = async (req, res) => {
    const record = (0, http_1.requireRecord)(await account_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    if (record.isSuperAdmin || record.id === res.locals.currentAdmin.id)
        throw new http_1.HttpError(400, "Không thể khóa quản trị cao nhất hoặc chính mình.");
    await account_model_1.default.updateOne({ _id: record.id }, { $set: { status: (0, http_1.status)(req.body.status) } });
    await (0, auth_1.revokeSessions)(record.id, "admin");
    (0, http_1.success)(res, basePath);
};
exports.changeStatus = changeStatus;
const deleteItem = async (req, res) => {
    const record = (0, http_1.requireRecord)(await account_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false }));
    if (record.isSuperAdmin || record.id === res.locals.currentAdmin.id)
        throw new http_1.HttpError(400, "Không thể xóa quản trị cao nhất hoặc chính mình.");
    await account_model_1.default.updateOne({ _id: record.id }, { $set: { deleted: true, deletedAt: new Date() } });
    await (0, auth_1.revokeSessions)(record.id, "admin");
    (0, http_1.success)(res, basePath, "Đã xóa tài khoản.");
};
exports.deleteItem = deleteItem;
