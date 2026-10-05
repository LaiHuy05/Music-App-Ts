import { Request, Response } from "express";
import Song from "../../models/song.model";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";
import { systemconfig } from "../../config/config";
import { objectId, requireRecord, listFilter, success, status, text, mediaUrl, HttpError } from "../../helpers/http";
import { catalogData, description } from "../../helpers/catalog";

const basePath = `/${systemconfig.prefixAdmin}/songs`;
const options = async () => ({ topics: await Topic.find({ deleted: false }).select("title status"), singers: await Singer.find({ deleted: false }).select("fullName status") });
const songData = async (body: any) => {
  const data = { ...catalogData(body, "title"), topicId: objectId(body.topicId), singerId: objectId(body.singerId), lyrics: text(body.lyrics, 100000) };
  if (!await Topic.exists({ _id: data.topicId, deleted: false }) || !await Singer.exists({ _id: data.singerId, deleted: false })) throw new HttpError(400, "Chủ đề hoặc ca sĩ không còn tồn tại.");
  const audio = Array.isArray(body.audio) ? body.audio[0] : body.audioUrl;
  if (audio) data.audio = mediaUrl(audio);
  return data;
};
export const index = async (req: Request, res: Response) => {
  const songs = await Song.find(listFilter(req)).sort({ createdAt: -1 });
  res.render("admin/pages/songs/index", { pageTitle: "Quản lý bài hát", songs });
};
export const create = async (_req: Request, res: Response) => res.render("admin/pages/songs/create", { pageTitle: "Thêm bài hát", ...await options() });
export const createPost = async (req: Request, res: Response) => {
  const data = await songData(req.body);
  if (!data.audio) throw new HttpError(400, "Vui lòng tải lên file âm thanh hoặc nhập URL âm thanh.");
  await Song.create(data);
  success(res, basePath);
};
export const detail = async (req: Request, res: Response) => {
  const song = requireRecord(await Song.findOne({ _id: objectId(req.params.id), deleted: false }));
  song.description = description(song.description);
  res.render("admin/pages/songs/detail", { pageTitle: "Chi tiết bài hát", song, topic: await Topic.findById(song.topicId), singer: await Singer.findById(song.singerId) });
};
export const edit = async (req: Request, res: Response) => {
  const song = requireRecord(await Song.findOne({ _id: objectId(req.params.id), deleted: false }));
  res.render("admin/pages/songs/edit", { pageTitle: "Sửa bài hát", song, ...await options() });
};
export const editPatch = async (req: Request, res: Response) => {
  const song = requireRecord(await Song.findOne({ _id: objectId(req.params.id), deleted: false }));
  Object.assign(song, await songData(req.body));
  await song.save();
  success(res, basePath);
};
export const changeStatus = async (req: Request, res: Response) => {
  requireRecord(await Song.findOneAndUpdate({ _id: objectId(req.params.id), deleted: false }, { $set: { status: status(req.body.status) } }, { returnDocument: "after", runValidators: true }));
  success(res, basePath);
};
export const deleteItem = async (req: Request, res: Response) => {
  requireRecord(await Song.findOneAndUpdate({ _id: objectId(req.params.id), deleted: false }, { $set: { deleted: true, deletedAt: new Date() } }));
  success(res, basePath, "Đã xóa bài hát.");
};
