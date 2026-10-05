import mongoose from "mongoose";

let connection: Promise<typeof mongoose> | undefined;
export const connect = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URL) throw new Error("MONGO_URL is required.");
  if (!connection) connection = mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 }).catch(error => { connection = undefined; throw error; });
  await connection;
};
