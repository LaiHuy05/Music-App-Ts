"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.songsWithSingers = void 0;
const singer_model_1 = __importDefault(require("../models/singer.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const songsWithSingers = async (records) => {
    const ids = [...new Set(records.map(song => song.singerId).filter(id => mongoose_1.default.isObjectIdOrHexString(id)))];
    const singers = await singer_model_1.default.find({ _id: { $in: ids }, deleted: false, status: "active" }).select("fullName");
    const names = new Map(singers.map(singer => [singer.id, singer.fullName]));
    return records.map(record => ({ ...(record.toObject ? record.toObject() : record), id: String(record._id), infoSinger: { fullName: names.get(record.singerId) || "Chưa cập nhật ca sĩ" } }));
};
exports.songsWithSingers = songsWithSingers;
