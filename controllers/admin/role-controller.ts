import { Request, Response } from "express";
import Role from "../../models/role.model";
import Account from "../../models/account.model";
import { objectId, requireRecord, requiredText, text, status, success, HttpError } from "../../helpers/http";
import { permissionGroups, permissionLabels, allPermissions } from "../../config/permissions";
import { systemconfig } from "../../config/config";

const basePath = `/${systemconfig.prefixAdmin}/roles`;
const data = (body: any) => ({ title: requiredText(body.title, "tên nhóm quyền", 100), description: text(body.description, 1000), status: status(body.status) });
export const index = async (_req: Request, res: Response) => res.render("admin/pages/roles/index", { pageTitle: "Nhóm quyền", roles: await Role.find({ deleted: false }).sort({ createdAt: -1 }) });
export const create = (_req: Request, res: Response) => res.render("admin/pages/roles/form", { pageTitle: "Thêm nhóm quyền", role: null });
export const createPost = async (req: Request, res: Response) => { await Role.create(data(req.body)); success(res, basePath); };
export const edit = async (req: Request, res: Response) => res.render("admin/pages/roles/form", { pageTitle: "Sửa nhóm quyền", role: requireRecord(await Role.findOne({ _id: objectId(req.params.id), deleted: false })) });
export const editPatch = async (req: Request, res: Response) => {
  requireRecord(await Role.findOneAndUpdate({ _id: objectId(req.params.id), deleted: false }, { $set: data(req.body) }, { returnDocument: "after", runValidators: true }));
  success(res, basePath);
};
export const deleteItem = async (req: Request, res: Response) => {
  const id = objectId(req.params.id);
  if (await Account.exists({ roleId: id, deleted: false })) throw new HttpError(400, "Nhóm quyền đang có tài khoản sử dụng.");
  requireRecord(await Role.findOneAndUpdate({ _id: id, deleted: false }, { $set: { deleted: true, deletedAt: new Date() } }));
  success(res, basePath, "Đã xóa nhóm quyền.");
};
export const permissions = async (_req: Request, res: Response) => res.render("admin/pages/roles/permissions", { pageTitle: "Phân quyền", roles: await Role.find({ deleted: false }), permissionGroups, permissionLabels });
export const permissionsPatch = async (req: Request, res: Response) => {
  const roleIds = [...new Set(Array.isArray(req.body.roleIds) ? req.body.roleIds : req.body.roleIds ? [req.body.roleIds] : [])] as string[];
  const roles = await Role.find({ _id: { $in: roleIds.map(objectId) }, deleted: false });
  if (roles.length !== roleIds.length) throw new HttpError(400, "Nhóm quyền đã thay đổi. Vui lòng tải lại trang.");
  const updates = roles.map(role => {
    const values = req.body.permissions?.[role.id] || [];
    const permissions = [...new Set(Array.isArray(values) ? values : [values])];
    if (permissions.some(permission => !allPermissions.includes(String(permission)))) throw new HttpError(400, "Quyền không hợp lệ.");
    return { updateOne: { filter: { _id: role.id, deleted: false }, update: { $set: { permissions } } } };
  });
  if (updates.length) await Role.bulkWrite(updates);
  success(res, `${basePath}/permissions`, "Đã cập nhật phân quyền.");
};
