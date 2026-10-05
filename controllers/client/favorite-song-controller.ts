import { Request, Response } from "express";
import FavoriteSong from "../../models/favorite-song.model";
import Song from "../../models/song.model";
import { songsWithSingers } from "../../helpers/song-info";
import mongoose from "mongoose";

export const index = async (_req: Request, res: Response) => {
  const favorites = await FavoriteSong.find({ userId: res.locals.currentUser.id, deleted: false }).sort({ createdAt: -1 });
  const ids = favorites.map(item => item.songId).filter(id => mongoose.isObjectIdOrHexString(id));
  const songs = await songsWithSingers(await Song.find({ _id: { $in: ids }, status: "active", deleted: false }));
  const songMap = new Map(songs.map(song => [song.id, song]));
  const favoriteSongs = favorites.filter(item => songMap.has(item.songId)).map(item => ({ songId: item.songId, infoSong: songMap.get(item.songId), infoSinger: songMap.get(item.songId).infoSinger }));
  res.render("client/pages/favorite-songs/index", { pageTitle: "Bài hát yêu thích", favoriteSongs });
};
