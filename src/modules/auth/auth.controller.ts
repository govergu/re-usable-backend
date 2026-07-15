import { asyncHandler } from "@common/utils/asyncHandler.js";
import { loginUser, registerUser } from "./auth.service.js";
import { ApiResponse } from "@common/utils/apiResponse.js";
import { HTTP_STATUS } from "@common/constants/httpStatusCode.js";
import { Request, Response } from "express";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const user = await registerUser(name, email, password);

  return ApiResponse.success(
    res,
    user,
    "Check you email for verification",
    HTTP_STATUS.CREATED,
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user } = await loginUser(email, password);

  //   setTokenCookie(res, "accessToken", accessToken, ACCESS_TOKEN_EXPIRY);
  //   setTokenCookie(res, "refreshToken", refreshToken, REFRESH_TOKEN_EXPIRY);
  //   setCsrfCookie(res);
  return ApiResponse.success(
    res,
    user,
    "Successfully logged in",
    HTTP_STATUS.OK,
  );
});
