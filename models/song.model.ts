import mongoose from "mongoose";
import slug from "mongoose-slug-updater";

mongoose.plugin(slug)

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    avatar: String,
    description: String,
    singerId: String,
    topicId: String,
    like: {
      type: Number,
      min: 0,
      default: 0
    },
    likedBy: { type: [String], default: [], select: false },
    listen: {
      type: Number,
      min: 0,
      default: 0
    },
    lyrics: String,
    audio: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    slug: {
      type: String,
      slug:"title",
      unique: true
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Song = mongoose.model("Song", songSchema, "songs");

export default Song;
