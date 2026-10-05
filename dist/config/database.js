"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let connection;
const connect = async () => {
    if (mongoose_1.default.connection.readyState === 1)
        return;
    if (!process.env.MONGO_URL)
        throw new Error("MONGO_URL is required.");
    if (!connection)
        connection = mongoose_1.default.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 }).catch(error => { connection = undefined; throw error; });
    await connection;
};
exports.connect = connect;
