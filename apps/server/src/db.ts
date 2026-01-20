import mongoose from "mongoose";
import { env } from "./env";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDb = async () => {
  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(env.mongoUri);

      return;
    } catch {
      if (attempt === maxAttempts) {
        throw new Error("Failed to connect to MongoDB");
      }

      await delay(2000);
    }
  }
};
