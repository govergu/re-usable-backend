import { Prisma, User } from "@generated/prisma/client.js";
import { UserRepository } from "./user.repository.js";
import { AppError } from "@common/utils/appError.js";
import { HTTP_STATUS } from "@common/constants/httpStatusCode.js";

export class UserService {
  //   private userRepository: UserRepository;

  constructor(private userRepository: UserRepository) {
    // this.userRepository = new UserRepository();
  }

  async updateProfile(
    inputData: Prisma.UserUpdateInput,
    userId: string,
  ): Promise<User> {
    if (!userId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");
    }
    return this.userRepository.update(userId, inputData);
  }
}
