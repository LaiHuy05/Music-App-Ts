import { Request, Response } from "express";
import Song from "../../models/song.model";
import { convertToSlug } from "../../helpers/convertToSlug";
import { songsWithSingers } from "../../helpers/song-info";
import { text, HttpError } from "../../helpers/http";

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const result = async (req: Request, res: Response) => {
  const type = req.params.type;
  if (type !== "result" && type !== "suggest") throw new HttpError(404, "Không tìm thấy trang tìm kiếm.");
  const keyword = text(req.query.keyword, 100);
  const records = keyword ? await Song.find({ status: "active", deleted: false, $or: [
    { title: new RegExp(escapeRegex(keyword), "i") }, { slug: new RegExp(escapeRegex(convertToSlug(keyword)), "i") }
  ] }).select("title avatar singerId like listen slug createdAt").limit(type === "suggest" ? 8 : 100) : [];
  const songs = await songsWithSingers(records);
  if (type === "suggest") return res.json({ code: 200, songs });
  res.render("client/pages/search/result", { pageTitle: `Kết quả: ${keyword}`, keyword, songs });
};
