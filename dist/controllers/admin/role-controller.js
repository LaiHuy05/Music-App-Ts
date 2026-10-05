"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionsPatch = exports.permissions = exports.deleteItem = exports.editPatch = exports.edit = exports.createPost = exports.create = exports.index = void 0;
const role_model_1 = __importDefault(require("../../models/role.model"));
const account_model_1 = __importDefault(require("../../models/account.model"));
const http_1 = require("../../helpers/http");
const permissions_1 = require("../../config/permissions");
const config_1 = require("../../config/config");
const basePath = `/${config_1.systemconfig.prefixAdmin}/roles`;
const data = (body) => ({ title: (0, http_1.requiredText)(body.title, "tên nhóm quyền", 100), description: (0, http_1.text)(body.description, 1000), status: (0, http_1.status)(body.status) });
const index = async (_req, res) => res.render("admin/pages/roles/index", { pageTitle: "Nhóm quyền", roles: await role_model_1.default.find({ deleted: false }).sort({ createdAt: -1 }) });
exports.index = index;
const create = (_req, res) => res.render("admin/pages/roles/form", { pageTitle: "Thêm nhóm quyền", role: null });
exports.create = create;
const createPost = async (req, res) => { await role_model_1.default.create(data(req.body)); (0, http_1.success)(res, basePath); };
exports.createPost = createPost;
const edit = async (req, res) => res.render("admin/pages/roles/form", { pageTitle: "Sửa nhóm quyền", role: (0, http_1.requireRecord)(await role_model_1.default.findOne({ _id: (0, http_1.objectId)(req.params.id), deleted: false })) });
exports.edit = edit;
const editPatch = async (req, res) => {
    (0, http_1.requireRecord)(await role_model_1.default.findOneAndUpdate({ _id: (0, http_1.objectId)(req.params.id), deleted: false }, { $set: data(req.body) }, { returnDocument: "after", runValidators: true }));
    (0, http_1.success)(res, basePath);
};
exports.editPatch = editPatch;
const deleteItem = async (req, res) => {
    const id = (0, http_1.objectId)(req.params.id);
    if (await account_model_1.default.exists({ roleId: id, deleted: false }))
        throw new http_1.HttpError(400, "Nhóm quyền đang có tài khoản sử dụng.");
    (0, http_1.requireRecord)(await role_model_1.default.findOneAndUpdate({ _id: id, deleted: false }, { $set: { deleted: true, deletedAt: new Date() } }));
    (0, http_1.success)(res, basePath, "Đã xóa nhóm quyền.");
};
exports.deleteItem = deleteItem;
const permissions = async (_req, res) => res.render("admin/pages/roles/permissions", { pageTitle: "Phân quyền", roles: await role_model_1.default.find({ deleted: false }), permissionGroups: permissions_1.permissionGroups, permissionLabels: permissions_1.permissionLabels });
exports.permissions = permissions;
const permissionsPatch = async (req, res) => {
    const roleIds = [...new Set(Array.isArray(req.body.roleIds) ? req.body.roleIds : req.body.roleIds ? [req.body.roleIds] : [])];
    const roles = await role_model_1.default.find({ _id: { $in: roleIds.map(http_1.objectId) }, deleted: false });
    if (roles.length !== roleIds.length)
        throw new http_1.HttpError(400, "Nhóm quyền đã thay đổi. Vui lòng tải lại trang.");
    const updates = roles.map(role => {
        const values = req.body.permissions?.[role.id] || [];
        const permissions = [...new Set(Array.isArray(values) ? values : [values])];
        if (permissions.some(permission => !permissions_1.allPermissions.includes(String(permission))))
            throw new http_1.HttpError(400, "Quyền không hợp lệ.");
        return { updateOne: { filter: { _id: role.id, deleted: false }, update: { $set: { permissions } } } };
    });
    if (updates.length)
        await role_model_1.default.bulkWrite(updates);
    (0, http_1.success)(res, `${basePath}/permissions`, "Đã cập nhật phân quyền.");
};
exports.permissionsPatch = permissionsPatch;
