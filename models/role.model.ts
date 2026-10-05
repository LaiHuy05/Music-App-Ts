import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  permissions: { type: [String], default: [] },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  deleted: { type: Boolean, default: false },
  deletedAt: Date
}, { timestamps: true });

export default mongoose.model("Role", schema, "roles");
