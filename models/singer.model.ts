import { stat } from "fs";
import mongoose from "mongoose";

const singerSchema = new mongoose.Schema(
  {
    fullName: String,
    avtar: String,
    status: String,
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