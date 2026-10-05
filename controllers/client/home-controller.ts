import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import { songsWithSingers } from "../../helpers/song-info";

export const index = async (_req: Request, res: Response) => {
  const filter = { status: "active" as const, deleted: false };
  const fields = "title avatar singerId like listen slug createdAt";
  const [topics, liked, listened] = await Promise.all([
    Topic.find(filter).sort({ createdAt: -1, _id: -1 }).limit(3),
    Song.find(filter).select(fields).sort({ like: -1, _id: -1 }).limit(10),
    Song.find(filter).select(fields).sort({ listen: -1, _id: -1 }).limit(10)
  ]);
  res.render("client/pages/home/index", { pageTitle: "Trang chủ", topics, topLiked: await songsWithSingers(liked), topListened: await songsWithSingers(listened) });
};
