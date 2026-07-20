import bcrypt from "bcryptjs";
import { IPasswordHasher } from "@common/interfaces/password-hasher.interface.js";

export class BcryptHasher implements IPasswordHasher {
  constructor(private readonly saltRounds: number = 10) {}

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  async compare(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
}
