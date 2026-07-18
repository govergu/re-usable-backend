import { asyncHandler } from "@common/utils/asyncHandler.js";
import { UserService } from "./user.service.js";
import { Request, Response } from "express";
import { ApiResponse } from "@common/utils/apiResponse.js";
import { HTTP_STATUS } from "@common/constants/httpStatusCode.js";

const userService = new UserService();

export const updateProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const updatedUser = await userService.updateProfile(req.body, req.user.id);

    return ApiResponse.success(
      res,
      { user: updatedUser },
      "User profile updated successfully",
      HTTP_STATUS.OK,
    );
  },
);
