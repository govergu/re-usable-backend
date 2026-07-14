import { Response } from "express";

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = "Operation successful",
    statusCode = 200,
    extra = {},
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...extra,
    });
  }
}
