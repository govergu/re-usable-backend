import { IUser } from "../modules/user/user.types";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // This adds the 'user' property to the Request type globally
    }
  }
}
