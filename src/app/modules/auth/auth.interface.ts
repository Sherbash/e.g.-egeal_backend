import { UserRole } from "../user/user.interface";

export interface IAuth {
  email: string;
  password: string;
}

export interface IJwtPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}
