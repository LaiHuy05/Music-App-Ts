"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    permissions: { type: [String], default: [] },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    deleted: { type: Boolean, default: false },
    deletedAt: Date
}, { timestamps: true });
exports.default = mongoose_1.default.model("Role", schema, "roles");
