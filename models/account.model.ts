import mongoose from "mongoose";

const schema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String, default: "" },
  phone: { type: String, default: "" },
  roleId: { type: String, default: "" },
  isSuperAdmin: { type: Boolean, default: false },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  deleted: { type: Boolean, default: false },
  deletedAt: Date
}, { timestamps: true });

export default mongoose.model("Account", schema, "accounts");
