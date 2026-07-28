import mongoose from "mongoose";
import { env } from "./env";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDb = async () => {
  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(env.mongoUri);

      console.log("[Database] Connected to MongoDB");

      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.error(`[Database] Connection attempt ${attempt}/${maxAttempts} failed: ${message}`);

      if (attempt === maxAttempts) {
        throw new Error(`Failed to connect to MongoDB after ${maxAttempts} attempts: ${message}`);
      }

      await delay(2000);
    }
  }
};
