import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ENV } from "@config/env.js";
import {
  ITokenService,
  GeneratedTokenPair,
} from "@common/interfaces/token-service.interface.js";
import { signAccessToken, signRefreshToken } from "@common/utils/jwt.js";

export class CryptoJwtTokenService implements ITokenService {
  generateRandomToken(): GeneratedTokenPair {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = this.hashToken(rawToken);
    return { rawToken, hashedToken };
  }

  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  signAccessToken(userId: string, role: string): string {
    return signAccessToken(userId, role);
  }

  signRefreshToken(userId: string, role: string): string {
    return signRefreshToken(userId, role);
  }

  verifyAccessToken(token: string): { id: string; role: string } {
    return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as {
      id: string;
      role: string;
    };
  }

  verifyRefreshToken(token: string): { id: string; role: string } {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as {
      id: string;
      role: string;
    };
  }
}
