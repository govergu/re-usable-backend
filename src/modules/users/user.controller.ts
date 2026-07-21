import { asyncHandler } from "@common/utils/asyncHandler.js";
import { Request, Response } from "express";
import { ApiResponse } from "@common/utils/apiResponse.js";
import { HTTP_STATUS } from "@common/constants/httpStatusCode.js";
import { UserMapper } from "./user.mapper.js";
import { userService } from "./user.factory.js";

export const updateProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const updatedUser = await userService.updateProfile(req.body, req.user.id);

    const responseData = UserMapper.toResponse(updatedUser);

    return ApiResponse.success(
      res,
      { user: responseData },
      "User profile updated successfully",
      HTTP_STATUS.OK,
    );
  },
);
