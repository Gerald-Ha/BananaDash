import { Request } from "express";
import { UserDocument } from "./models/User";

export interface AuthRequest extends Request {
  user?: UserDocument;
}
