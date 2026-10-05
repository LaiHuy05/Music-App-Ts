"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const singerSchema = new mongoose_1.default.Schema({
    fullName: { type: String, required: true, trim: true },
    avatar: String,
    description: String,
    avtar: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    slug: String,
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
}, {
    timestamps: true,
});
const Singer = mongoose_1.default.model("Singer", singerSchema, "singers");
exports.default = Singer;
