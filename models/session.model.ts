import mongoose from "mongoose";

const schema = new mongoose.Schema({
  accountId: { type: String, required: true, index: true },
  kind: { type: String, enum: ["admin", "client"], required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, expires: 0 }
}, { timestamps: true });

export default mongoose.model("Session", schema, "sessions");
