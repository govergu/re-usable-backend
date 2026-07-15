import { ENV } from "@config/env.js";
import { Response } from "express";

export const setTokenCookie = (
  res: Response,
  name: "accessToken" | "refreshToken",
  token: string,
  expiresInSeconds: number,
) => {
  res.cookie(name, token, {
    httpOnly: true, // XSS protection
    secure: ENV.NODE_ENV === "production",
    sameSite: "strict", // CSRF protection for modern browsers
    maxAge: expiresInSeconds * 1000, // Convert to milliseconds
  });
};
