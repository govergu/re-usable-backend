import { ENV } from "@config/env.js";
import jwt from "jsonwebtoken";

export const signAccessToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, ENV.JWT_ACCESS_SECRET as string, {
    expiresIn: ENV.JWT_ACCESS_EXPIRES as any,
  });
};

export const signRefreshToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, ENV.JWT_REFRESH_SECRET as string, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES as any,
  });
};
