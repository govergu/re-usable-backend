import { AppError } from "./appError.js";
import { HTTP_STATUS } from "@common/constants/index.js"; // Assuming you mapped your codes here

export class Errors {
  static badRequest(message = "Bad Request"): AppError {
    return new AppError(HTTP_STATUS.BAD_REQUEST, message);
  }

  static unauthorized(message = "Unauthorized access"): AppError {
    return new AppError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message = "Access forbidden"): AppError {
    return new AppError(HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message = "Requested resource not found"): AppError {
    return new AppError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message = "Resource conflict occurred"): AppError {
    return new AppError(HTTP_STATUS.CONFLICT, message);
  }

  static internal(message = "Internal server malfunction"): AppError {
    return new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message);
  }
}
