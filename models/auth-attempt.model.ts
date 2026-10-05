import mongoose from "mongoose";
const schema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, expires: 0, required: true }
});
export default mongoose.model("AuthAttempt", schema, "auth-attempts");
