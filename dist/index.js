"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = require("./app");
const database_1 = require("./config/database");
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET)
    throw new Error("SESSION_SECRET is required in production.");
const app = (0, app_1.createApp)();
if (require.main === module) {
    (0, database_1.connect)().then(() => app.listen(process.env.PORT || 3000, () => console.log("Music App is running."))).catch(() => { console.error("Không kết nối được MongoDB. Kiểm tra MONGO_URL."); process.exitCode = 1; });
}
exports.default = app;
