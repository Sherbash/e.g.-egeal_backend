import status from "http-status";
import AppError from "../../errors/appError";
import { IAuth, IJwtPayload } from "./auth.interface";
import User from "../user/user.model";
import bcrypt from "bcrypt";
import { createToken } from "./auth.utils";
import config from "../../config";
import { UserRole } from "../user/user.interface";

const loginUser = async (payload: IAuth) => {
  const { email, password } = payload;

  // Validate input
  if (!email || !password) {
    throw new AppError(status.BAD_REQUEST, "Email and password are required!");
  }

  // Check existing user
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(
      status.NOT_FOUND,
      "User with this email does not exist!"
    );
  }

  if (!user.isActive) {
    throw new AppError(status.FORBIDDEN, "This user is not active!");
  }

  // Check password match
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new AppError(status.UNAUTHORIZED, "Incorrect password!");
  }

  const jwtPayload: IJwtPayload = {
    id: user._id.toString(),
    firstName: user.firstName as string,
    lastName: user.lastName as string,
    email: user.email as string,
    role: user.role as UserRole,
    isActive: user.isActive,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    accessToken,
  };
};

export const AuthService = {
  loginUser,
};
