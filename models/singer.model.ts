import mongoose from "mongoose";

const singerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    avatar: String,
    description: String,
    // Keep the old misspelled field readable for existing records.
    avtar: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    slug: String,
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

const Singer = mongoose.model("Singer", singerSchema, "singers");

export default Singer;
