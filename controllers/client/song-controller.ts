import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";
import FavoriteSong from "../../models/favorite-song.model";
import { objectId, requireRecord, HttpError } from "../../helpers/http";
import { songsWithSingers } from "../../helpers/song-info";
import { description } from "../../helpers/catalog";

export const list = async (req: Request, res: Response) => {
  const topic = requireRecord(await Topic.findOne({ slug: req.params.slugTopic, status: "active", deleted: false }), "Chủ đề không tồn tại.");
  const songs = await Song.find({ topicId: topic.id, status: "active", deleted: false }).select("title avatar singerId like listen slug createdAt");
  res.render("client/pages/songs/list", { pageTitle: topic.title, songs: await songsWithSingers(songs) });
};
export const detail = async (req: Request, res: Response) => {
  const record = requireRecord(await Song.findOne({ slug: req.params.slugSong, status: "active", deleted: false }).select("+likedBy"), "Bài hát không tồn tại.");
  const singer = await Singer.findOne({ _id: record.singerId, deleted: false, status: "active" }).select("fullName") || { fullName: "Chưa cập nhật ca sĩ" };
  const topic = await Topic.findOne({ _id: record.topicId, deleted: false, status: "active" }).select("title") || { title: "Chưa cập nhật chủ đề" };
  const userId = res.locals.currentUser?.id;
  const favorite = userId ? await FavoriteSong.exists({ userId, songId: record.id, deleted: false }) : null;
  const song: any = { ...record.toObject(), id: record.id, isFavoriteSong: !!favorite, isLiked: !!userId && record.likedBy.includes(userId) };
  delete song.likedBy;
  song.description = description(song.description);
  res.render("client/pages/songs/detail", { pageTitle: song.title, song, singer, topic });
};
export const like = async (req: Request, res: Response) => {
  const id = objectId(req.params.idSong);
  const userId = res.locals.currentUser.id;
  const action = req.params.typeLike;
  if (action !== "like" && action !== "dislike") throw new HttpError(400, "Thao tác thích không hợp lệ.");
  const filter = { _id: id, status: "active" as const, deleted: false };
  if (action === "like") {
    await Song.updateOne({ ...filter, likedBy: { $ne: userId } }, { $addToSet: { likedBy: userId }, $inc: { like: 1 } });
  } else {
    await Song.updateOne({ ...filter, likedBy: userId }, [{ $set: {
      likedBy: { $setDifference: [{ $ifNull: ["$likedBy", []] }, [userId]] },
      like: { $max: [0, { $subtract: [{ $ifNull: ["$like", 0] }, 1] }] }
    } }], { updatePipeline: true });
  }
  const song = requireRecord(await Song.findOne(filter).select("like +likedBy"), "Bài hát không tồn tại.");
  res.json({ code: 200, message: "Cập nhật lượt thích thành công.", like: song.like, isLiked: song.likedBy.includes(userId) });
};
export const favorite = async (req: Request, res: Response) => {
  const songId = objectId(req.params.idSong);
  const userId = res.locals.currentUser.id;
  requireRecord(await Song.exists({ _id: songId, status: "active", deleted: false }), "Bài hát không tồn tại.");
  if (req.params.typeFavorite === "favorite") {
    try { await FavoriteSong.findOneAndUpdate({ userId, songId }, { $set: { deleted: false } }, { upsert: true, runValidators: true }); }
    catch (error: any) { if (error.code !== 11000) throw error; }
  } else if (req.params.typeFavorite === "unfavorite") await FavoriteSong.deleteOne({ userId, songId });
  else throw new HttpError(400, "Thao tác yêu thích không hợp lệ.");
  res.json({ code: 200, message: "Cập nhật yêu thích thành công.", isFavorite: req.params.typeFavorite === "favorite" });
};
export const listen = async (req: Request, res: Response) => {
  const song = requireRecord(await Song.findOneAndUpdate({ _id: objectId(req.params.idSong), status: "active", deleted: false }, { $inc: { listen: 1 } }, { returnDocument: "after" }).select("listen"), "Bài hát không tồn tại.");
  res.json({ code: 200, message: "Đã cập nhật lượt nghe.", listen: song.listen });
};
