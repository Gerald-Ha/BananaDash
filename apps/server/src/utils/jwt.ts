import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../env";

export const signToken = (userId: string) => {
  return jwt.sign({ userId }, env.jwtSecret as Secret, { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] });
};
