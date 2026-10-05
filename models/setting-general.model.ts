import mongoose from "mongoose";

const schema = new mongoose.Schema({
  key: { type: String, default: "general", unique: true },
  websiteName: { type: String, default: "Music App" },
  logo: { type: String, default: "/images/logo.png" },
  description: { type: String, default: "Nghe nhạc và lưu bài hát bạn yêu thích." },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  copyright: { type: String, default: "Copyright © 2026 Music App. All rights reserved." }
}, { timestamps: true });

export default mongoose.model("SettingGeneral", schema, "settings-general");
