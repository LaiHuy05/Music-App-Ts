import { Request, Response } from "express";
import Account from "../../models/account.model";
import Role from "../../models/role.model";
import { objectId, requireRecord, listFilter, success, status, HttpError } from "../../helpers/http";
import { accountData } from "../../helpers/account-data";
import { revokeSessions, createSession } from "../../helpers/auth";
import { systemconfig } from "../../config/config";

const basePath = `/${systemconfig.prefixAdmin}/accounts`;
const roles = () => Role.find({ deleted: false, status: "active" });
const validRole = async (id: unknown) => requireRecord(await Role.findOne({ _id: objectId(id), deleted: false, status: "active" }), "Nhóm quyền không tồn tại hoặc đã bị khóa.").id;
const editable = (record: any, res: Response) => {
  if (record.isSuperAdmin && record.id !== res.locals.currentAdmin.id) throw new HttpError(403, "Không thể sửa tài khoản quản trị cao nhất của người khác.");
};
export const index = async (req: Request, res: Response) => {
  const records = await Account.find(listFilter(req, "fullName")).sort({ createdAt: -1 });
  res.render("admin/pages/accounts/index", { pageTitle: "Tài khoản admin", records, roles: await Role.find({ deleted: false }), basePath, resource: "accounts" });
};
export const create = async (_req: Request, res: Response) => res.render("admin/pages/accounts/form", { pageTitle: "Thêm tài khoản admin", record: null, roles: await roles(), basePath, resource: "accounts" });
export const createPost = async (req: Request, res: Response) => {
  await Account.create({ ...await accountData(req.body, true), roleId: await validRole(req.body.roleId) });
  success(res, basePath);
};
export const detail = async (req: Request, res: Response) => {
  const record = requireRecord(await Account.findOne({ _id: objectId(req.params.id), deleted: false }));
  res.render("admin/pages/accounts/detail", { pageTitle: "Chi tiết tài khoản admin", record, role: record.roleId ? await Role.findById(record.roleId) : null, basePath, resource: "accounts" });
};
export const edit = async (req: Request, res: Response) => {
  const record = requireRecord(await Account.findOne({ _id: objectId(req.params.id), deleted: false }));
  editable(record, res);
  res.render("admin/pages/accounts/form", { pageTitle: "Sửa tài khoản admin", record, roles: await roles(), basePath, resource: "accounts" });
};
export const editPatch = async (req: Request, res: Response) => {
  const record = requireRecord(await Account.findOne({ _id: objectId(req.params.id), deleted: false }));
  editable(record, res);
  const data = await accountData(req.body);
  data.roleId = record.isSuperAdmin ? record.roleId : await validRole(req.body.roleId);
  if (record.id === res.locals.currentAdmin.id && (data.status !== "active" || data.roleId !== record.roleId)) throw new HttpError(400, "Không thể tự khóa hoặc thay đổi nhóm quyền của chính mình.");
  if (record.isSuperAdmin && data.status !== "active") throw new HttpError(400, "Không thể khóa tài khoản quản trị cao nhất.");
  await Account.updateOne({ _id: record.id }, { $set: data }, { runValidators: true });
  await revokeSessions(record.id, "admin");
  if (record.id === res.locals.currentAdmin.id) await createSession(req, res, "admin", record.id);
  success(res, basePath);
};
export const changeStatus = async (req: Request, res: Response) => {
  const record = requireRecord(await Account.findOne({ _id: objectId(req.params.id), deleted: false }));
  if (record.isSuperAdmin || record.id === res.locals.currentAdmin.id) throw new HttpError(400, "Không thể khóa quản trị cao nhất hoặc chính mình.");
  await Account.updateOne({ _id: record.id }, { $set: { status: status(req.body.status) } });
  await revokeSessions(record.id, "admin");
  success(res, basePath);
};
export const deleteItem = async (req: Request, res: Response) => {
  const record = requireRecord(await Account.findOne({ _id: objectId(req.params.id), deleted: false }));
  if (record.isSuperAdmin || record.id === res.locals.currentAdmin.id) throw new HttpError(400, "Không thể xóa quản trị cao nhất hoặc chính mình.");
  await Account.updateOne({ _id: record.id }, { $set: { deleted: true, deletedAt: new Date() } });
  await revokeSessions(record.id, "admin");
  success(res, basePath, "Đã xóa tài khoản.");
};
