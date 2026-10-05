import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    avatar: String,
    description: String,
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

const Topic = mongoose.model("Topic", topicSchema, "topics");

export default Topic;
