import { Request, Response } from "express";
import User from "../../models/user.model";
import PasswordReset from "../../models/password-reset.model";
import { objectId, requireRecord, listFilter, success, status } from "../../helpers/http";
import { accountData } from "../../helpers/account-data";
import { revokeSessions } from "../../helpers/auth";
import { systemconfig } from "../../config/config";

const basePath = `/${systemconfig.prefixAdmin}/users`;
export const index = async (req: Request, res: Response) => {
  const records = await User.find(listFilter(req, "fullName")).sort({ createdAt: -1 });
  res.render("admin/pages/accounts/index", { pageTitle: "Tài khoản user", records, roles: [], basePath, resource: "users" });
};
export const create = (_req: Request, res: Response) => res.render("admin/pages/accounts/form", { pageTitle: "Thêm tài khoản user", record: null, roles: [], basePath, resource: "users" });
export const createPost = async (req: Request, res: Response) => {
  await User.create(await accountData(req.body, true));
  success(res, basePath);
};
export const detail = async (req: Request, res: Response) => {
  const record = requireRecord(await User.findOne({ _id: objectId(req.params.id), deleted: false }));
  res.render("admin/pages/accounts/detail", { pageTitle: "Chi tiết tài khoản user", record, role: null, basePath, resource: "users" });
};
export const edit = async (req: Request, res: Response) => {
  const record = requireRecord(await User.findOne({ _id: objectId(req.params.id), deleted: false }));
  res.render("admin/pages/accounts/form", { pageTitle: "Sửa tài khoản user", record, roles: [], basePath, resource: "users" });
};
export const editPatch = async (req: Request, res: Response) => {
  const id = objectId(req.params.id);
  const data = await accountData(req.body);
  requireRecord(await User.findOneAndUpdate({ _id: id, deleted: false }, { $set: data }, { returnDocument: "after", runValidators: true }));
  await revokeSessions(id, "client");
  await PasswordReset.deleteMany({ userId: id });
  success(res, basePath);
};
export const changeStatus = async (req: Request, res: Response) => {
  const id = objectId(req.params.id);
  requireRecord(await User.findOneAndUpdate({ _id: id, deleted: false }, { $set: { status: status(req.body.status) } }, { returnDocument: "after", runValidators: true }));
  await revokeSessions(id, "client");
  await PasswordReset.deleteMany({ userId: id });
  success(res, basePath);
};
export const deleteItem = async (req: Request, res: Response) => {
  const id = objectId(req.params.id);
  requireRecord(await User.findOneAndUpdate({ _id: id, deleted: false }, { $set: { deleted: true, deletedAt: new Date() } }));
  await revokeSessions(id, "client");
  await PasswordReset.deleteMany({ userId: id });
  success(res, basePath, "Đã xóa tài khoản.");
};
