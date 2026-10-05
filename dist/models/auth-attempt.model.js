"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    key: { type: String, unique: true, required: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, expires: 0, required: true }
});
exports.default = mongoose_1.default.model("AuthAttempt", schema, "auth-attempts");
