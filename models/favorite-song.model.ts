import mongoose from "mongoose";

const favoriteSongSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    songId: { type: String, required: true },
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

favoriteSongSchema.index({ userId: 1, songId: 1 }, { unique: true, partialFilterExpression: { userId: { $type: "string" }, songId: { $type: "string" } } });
const FavoriteSong = mongoose.model("FavoriteSong", favoriteSongSchema, "favorite-songs");

export default FavoriteSong;
