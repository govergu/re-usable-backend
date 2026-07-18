import { User } from "@generated/prisma/client.js";
import { UserResponseDTO } from "./user.dto.js";

export class UserMapper {
  static toResponse(user: User): UserResponseDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isBanned: user.isBanned,
      isVerified: user.isVerified,
    };
  }

  static toManyResponse(users: User[]): UserResponseDTO[] {
    return users.map((user) => this.toResponse(user));
  }
}
