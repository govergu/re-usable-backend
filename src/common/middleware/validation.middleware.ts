import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "fail",
          // Safely access the first error message
          message: error.message || "Validation failed",
          // errors: error, // Optional: send full details for debugging
        });
      }

      // Handle non-zod errors
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  };
