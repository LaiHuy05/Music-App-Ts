"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    key: { type: String, default: "general", unique: true },
    websiteName: { type: String, default: "Music App" },
    logo: { type: String, default: "/images/logo.png" },
    description: { type: String, default: "Nghe nhạc và lưu bài hát bạn yêu thích." },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    copyright: { type: String, default: "Copyright © 2026 Music App. All rights reserved." }
}, { timestamps: true });
exports.default = mongoose_1.default.model("SettingGeneral", schema, "settings-general");
