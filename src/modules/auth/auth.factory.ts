// src/modules/auth/auth.factory.ts
import { BcryptHasher } from "@infrastructure/security/bcrypt-hasher.service.js";
import { AuthRepository } from "./auth.repository.js";
import { AuthService } from "./auth.service.js";
import { CryptoJwtTokenService } from "@infrastructure/security/crypto-jwt.service.js";
import { ResilientNodemailerProvider } from "@infrastructure/email/node-mailer.provider.js";

export function createAuthModule() {
  const authRepository = new AuthRepository();
  const passwordHasher = new BcryptHasher(10);
  const tokenService = new CryptoJwtTokenService();
  const emailProvider = new ResilientNodemailerProvider();

  const authService = new AuthService(
    authRepository,
    passwordHasher,
    tokenService,
    emailProvider,
  );

  return {
    authService,
    // You can return controller methods or controller instances here
  };
}

export const { authService } = createAuthModule();
