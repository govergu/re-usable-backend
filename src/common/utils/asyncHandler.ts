import { NextFunction, Request, Response } from "express";

export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
