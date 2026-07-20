export interface GeneratedTokenPair {
  rawToken: string;
  hashedToken: string;
}

export interface ITokenService {
  generateRandomToken(): GeneratedTokenPair;
  hashToken(token: string): string;
  signAccessToken(userId: string, role: string): string;
  signRefreshToken(userId: string, role: string): string;
  verifyRefreshToken(token: string): { id: string; role: string };
}
