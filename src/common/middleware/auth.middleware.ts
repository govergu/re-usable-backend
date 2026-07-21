import { HTTP_STATUS } from "@common/constants/httpStatusCode.js";
import { ITokenService } from "@common/interfaces/token-service.interface.js";
import { AppError } from "@common/utils/appError.js";
import { CryptoJwtTokenService } from "@infrastructure/security/crypto-jwt.service.js";
import { AuthRepository } from "@modules/auth/auth.repository.js";
import { NextFunction, Request, Response } from "express";

export const makeProtectMiddleware = (
  tokenService: ITokenService,
  authRepository: AuthRepository,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(
        new AppError(HTTP_STATUS.UNAUTHORIZED, "You are not logged in"),
      );
    }

    try {
      const decoded = tokenService.verifyAccessToken(token);
      const user = await authRepository.findById(decoded.id);

      if (!user) {
        return next(new AppError(HTTP_STATUS.UNAUTHORIZED, "User not found"));
      }

      if (user.isBanned) {
        return next(
          new AppError(
            HTTP_STATUS.FORBIDDEN,
            "Your account has been banned. Access denied.",
          ),
        );
      }
      req.user = user;
      next();
    } catch {
      return next(
        new AppError(HTTP_STATUS.UNAUTHORIZED, "Invalid or expired token"),
      );
    }
  };
};
const defaultTokenService = new CryptoJwtTokenService();
const defaultAuthRepository = new AuthRepository();

export const protect = makeProtectMiddleware(
  defaultTokenService,
  defaultAuthRepository,
);

// export const protect = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   let token;

//   // 1. Check Authorization header
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   // 2. Check cookies (IMPORTANT for your system)
//   else if (req.cookies?.accessToken) {
//     token = req.cookies.accessToken;
//   }

//   // No token found
//   if (!token) {
//     return next(new AppError(401, "You are not logged in"));
//   }

//   try {
//     const decoded: any = jwt.verify(token, ENV.JWT_ACCESS_SECRET as string);

//     // check the database
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.id },
//       select: { id: true, isBanned: true, role: true, isVerified: true }, // Select only what you need for speed
//     });

//     // handle deleted users
//     if (!user) {
//       return next(
//         new AppError(401, "The user belonging to this token no longer exists."),
//       );
//     }

//     //  Handle banned users
//     if (user.isBanned) {
//       return next(
//         new AppError(403, "Your account has been banned. Access denied."),
//       );
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     return next(new AppError(401, "Invalid token"));
//   }
// };

export const requireVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user?.isVerified) {
    return next(new AppError(403, "Please verify your email address."));
  }
  next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (
    req.user &&
    req.user.role === "ADMIN"
    // || req.user.role === "MODERATOR"
  ) {
    next();
  } else {
    throw new AppError(403, "Access denied. Admins only.");
  }
};

export const isModerator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (
    req.user &&
    (req.user.role === "MODERATOR" || req.user.role === "ADMIN")
  ) {
    next();
  } else {
    throw new AppError(403, "Access denied. Moderators or Admins only.");
  }
};

// Utility to compare role hierarchy: ADMIN > MODERATOR > USER
export const roleRank = (role: string | undefined) => {
  switch (role) {
    case "ADMIN":
      return 3;
    case "MODERATOR":
      return 2;
    case "USER":
    default:
      return 1;
  }
};
