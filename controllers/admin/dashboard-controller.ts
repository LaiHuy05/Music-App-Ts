import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";
import Account from "../../models/account.model";
import User from "../../models/user.model";

export const index = async (_req: Request, res: Response) => {
  const [topics, songs, singers, accounts, users, totals, recentSongs] = await Promise.all([
    Topic.countDocuments({ deleted: false }), Song.countDocuments({ deleted: false }),
    Singer.countDocuments({ deleted: false }), Account.countDocuments({ deleted: false }),
    User.countDocuments({ deleted: false }),
    Song.aggregate([{ $match: { deleted: false } }, { $group: { _id: null, like: { $sum: "$like" }, listen: { $sum: "$listen" } } }]),
    Song.find({ deleted: false }).sort({ createdAt: -1 }).limit(5)
  ]);
  res.render("admin/pages/dashboard/index", { pageTitle: "Trang tổng quan", stats: { topics, songs, singers, accounts, users, like: totals[0]?.like || 0, listen: totals[0]?.listen || 0 }, recentSongs });
};
