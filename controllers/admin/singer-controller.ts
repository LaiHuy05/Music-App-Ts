import { Request, Response } from "express";
import Singer from "../../models/singer.model";
import Song from "../../models/song.model";
import { systemconfig } from "../../config/config";
import { objectId, requireRecord, listFilter, success, status, HttpError } from "../../helpers/http";
import { catalogData, catalogSlug, description } from "../../helpers/catalog";

const basePath = `/${systemconfig.prefixAdmin}/singers`;
export const index = async (req: Request, res: Response) => {
  const records = await Singer.find(listFilter(req, "fullName")).sort({ createdAt: -1 });
  res.render("admin/pages/catalog/index", { pageTitle: "Quản lý ca sĩ", records, basePath, resource: "singers", nameField: "fullName" });
};
export const create = (_req: Request, res: Response) => res.render("admin/pages/catalog/form", { pageTitle: "Thêm ca sĩ", record: null, basePath, nameField: "fullName" });
export const createPost = async (req: Request, res: Response) => {
  const singer = new Singer(catalogData(req.body, "fullName"));
  singer.slug = catalogSlug(singer.fullName, singer.id);
  await singer.save();
  success(res, basePath);
};
export const detail = async (req: Request, res: Response) => {
  const record = requireRecord(await Singer.findOne({ _id: objectId(req.params.id), deleted: false }));
  record.description = description(record.description);
  res.render("admin/pages/catalog/detail", { pageTitle: "Chi tiết ca sĩ", record, basePath, resource: "singers", nameField: "fullName" });
};
export const edit = async (req: Request, res: Response) => {
  const record = requireRecord(await Singer.findOne({ _id: objectId(req.params.id), deleted: false }));
  res.render("admin/pages/catalog/form", { pageTitle: "Sửa ca sĩ", record, basePath, nameField: "fullName" });
};
export const editPatch = async (req: Request, res: Response) => {
  const singer = requireRecord(await Singer.findOne({ _id: objectId(req.params.id), deleted: false }));
  Object.assign(singer, catalogData(req.body, "fullName"));
  if (!singer.slug) singer.slug = catalogSlug(singer.fullName, singer.id);
  await singer.save();
  success(res, basePath);
};
export const changeStatus = async (req: Request, res: Response) => {
  requireRecord(await Singer.findOneAndUpdate({ _id: objectId(req.params.id), deleted: false }, { $set: { status: status(req.body.status) } }, { returnDocument: "after", runValidators: true }));
  success(res, basePath);
};
export const deleteItem = async (req: Request, res: Response) => {
  const id = objectId(req.params.id);
  if (await Song.exists({ singerId: id, deleted: false })) throw new HttpError(400, "Ca sĩ đang có bài hát. Hãy chuyển hoặc xóa bài hát trước.");
  requireRecord(await Singer.findOneAndUpdate({ _id: id, deleted: false }, { $set: { deleted: true, deletedAt: new Date() } }));
  success(res, basePath, "Đã xóa ca sĩ.");
};
