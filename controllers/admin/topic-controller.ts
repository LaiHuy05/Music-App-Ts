import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import { systemconfig } from "../../config/config";
import { objectId, requireRecord, listFilter, success, status, HttpError } from "../../helpers/http";
import { catalogData, catalogSlug, description } from "../../helpers/catalog";

const basePath = `/${systemconfig.prefixAdmin}/topics`;
export const index = async (req: Request, res: Response) => {
  const records = await Topic.find(listFilter(req)).sort({ createdAt: -1 });
  res.render("admin/pages/catalog/index", { pageTitle: "Quản lý chủ đề", records, basePath, resource: "topics", nameField: "title" });
};
export const create = (_req: Request, res: Response) => res.render("admin/pages/catalog/form", { pageTitle: "Thêm chủ đề", record: null, basePath, nameField: "title" });
export const createPost = async (req: Request, res: Response) => {
  const topic = new Topic(catalogData(req.body, "title"));
  topic.slug = catalogSlug(topic.title, topic.id);
  await topic.save();
  success(res, basePath);
};
export const detail = async (req: Request, res: Response) => {
  const record = requireRecord(await Topic.findOne({ _id: objectId(req.params.id), deleted: false }));
  record.description = description(record.description);
  res.render("admin/pages/catalog/detail", { pageTitle: "Chi tiết chủ đề", record, basePath, resource: "topics", nameField: "title" });
};
export const edit = async (req: Request, res: Response) => {
  const record = requireRecord(await Topic.findOne({ _id: objectId(req.params.id), deleted: false }));
  res.render("admin/pages/catalog/form", { pageTitle: "Sửa chủ đề", record, basePath, nameField: "title" });
};
export const editPatch = async (req: Request, res: Response) => {
  const topic = requireRecord(await Topic.findOne({ _id: objectId(req.params.id), deleted: false }));
  Object.assign(topic, catalogData(req.body, "title"));
  if (!topic.slug) topic.slug = catalogSlug(topic.title, topic.id);
  await topic.save();
  success(res, basePath);
};
export const changeStatus = async (req: Request, res: Response) => {
  requireRecord(await Topic.findOneAndUpdate({ _id: objectId(req.params.id), deleted: false }, { $set: { status: status(req.body.status) } }, { returnDocument: "after", runValidators: true }));
  success(res, basePath);
};
export const deleteItem = async (req: Request, res: Response) => {
  const id = objectId(req.params.id);
  if (await Song.exists({ topicId: id, deleted: false })) throw new HttpError(400, "Chủ đề đang có bài hát. Hãy chuyển hoặc xóa bài hát trước.");
  requireRecord(await Topic.findOneAndUpdate({ _id: id, deleted: false }, { $set: { deleted: true, deletedAt: new Date() } }));
  success(res, basePath, "Đã xóa chủ đề.");
};
