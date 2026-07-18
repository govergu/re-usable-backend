import { User } from "@generated/prisma/client.js";
import { AuthResponseDTO } from "./auth.dto.js";

export class AuthMapper {
  static toResponse(user: User): AuthResponseDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isBanned: user.isBanned,
      isVerified: user.isVerified,
    };
  }

  //   static toManyResponse(users: User[]): AuthResponseDTO[] {
  //     return users.map((user) => this.toResponse(user));
  //   }
}
