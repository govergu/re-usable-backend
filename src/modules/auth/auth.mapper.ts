import { AuthResponseDTO } from "./auth.dto.js";
import { AuthUser } from "./auth.entity.js";

export class AuthMapper {
  static toResponse(user: AuthUser): AuthResponseDTO {
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
