import Singer from "../models/singer.model";
import mongoose from "mongoose";

export const songsWithSingers = async (records: any[]) => {
  const ids = [...new Set(records.map(song => song.singerId).filter(id => mongoose.isObjectIdOrHexString(id)))];
  const singers = await Singer.find({ _id: { $in: ids }, deleted: false, status: "active" }).select("fullName");
  const names = new Map(singers.map(singer => [singer.id, singer.fullName]));
  return records.map(record => ({ ...(record.toObject ? record.toObject() : record), id: String(record._id), infoSinger: { fullName: names.get(record.singerId) || "Chưa cập nhật ca sĩ" } }));
};
