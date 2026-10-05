"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
const favorite_song_model_1 = __importDefault(require("../../models/favorite-song.model"));
const song_model_1 = __importDefault(require("../../models/song.model"));
const song_info_1 = require("../../helpers/song-info");
const mongoose_1 = __importDefault(require("mongoose"));
const index = async (_req, res) => {
    const favorites = await favorite_song_model_1.default.find({ userId: res.locals.currentUser.id, deleted: false }).sort({ createdAt: -1 });
    const ids = favorites.map(item => item.songId).filter(id => mongoose_1.default.isObjectIdOrHexString(id));
    const songs = await (0, song_info_1.songsWithSingers)(await song_model_1.default.find({ _id: { $in: ids }, status: "active", deleted: false }));
    const songMap = new Map(songs.map(song => [song.id, song]));
    const favoriteSongs = favorites.filter(item => songMap.has(item.songId)).map(item => ({ songId: item.songId, infoSong: songMap.get(item.songId), infoSinger: songMap.get(item.songId).infoSinger }));
    res.render("client/pages/favorite-songs/index", { pageTitle: "Bài hát yêu thích", favoriteSongs });
};
exports.index = index;
