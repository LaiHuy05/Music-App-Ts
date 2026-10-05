import dotenv from "dotenv";
dotenv.config();
import { createApp } from "./app";
import { connect } from "./config/database";

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is required in production.");
const app = createApp();

if (require.main === module) {
  connect().then(() => app.listen(process.env.PORT || 3000, () => console.log("Music App is running."))).catch(() => { console.error("Không kết nối được MongoDB. Kiểm tra MONGO_URL."); process.exitCode = 1; });
}

export default app;
