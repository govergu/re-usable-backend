import { ENV } from "@config/env.js";
import { NextFunction, Request, Response } from "express";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something Spicy Eh!!";

  if (ENV.NODE_ENV === "development") {
    return res.status(statusCode).json({
      status: err.status || "error",
      message,
      stack: err.stack,
    });
  }

  // If a 403 Forbidden (Ban) or 401 Unauthorized occurs, wipe the auth cookies
  if (err.statusCode === 403 || err.statusCode === 401) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
  }

  return res.status(statusCode).json({
    status: err.status || "error",
    message,
  });
};
