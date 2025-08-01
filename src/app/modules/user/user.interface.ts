import { Document, Types } from "mongoose";

// Enum for User Roles
export enum UserRole {
  INFLUENCER = "influencer",
  FOUNDER = "founder",
  INVESTOR = "investor",
  USER = "user",
  ADMIN = "admin",
}


// User Schema Definition
export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string
  lastName: string
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  additionalNotes?: string; 
}
