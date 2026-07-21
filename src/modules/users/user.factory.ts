import { UserRepository } from "./user.repository.js";
import { UserService } from "./user.service.js";

export function createUserModule() {
  const userRepository = new UserRepository();

  const userService = new UserService(userRepository);

  return { userService };
}

export const { userService } = createUserModule();
