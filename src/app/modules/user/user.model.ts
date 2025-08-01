import mongoose, { Schema } from "mongoose";
import { IUser, UserRole } from "./user.interface";
import bcrypt from "bcrypt";
import config from "../../config";

// Create the User schema based on the interface
const userSchema = new Schema<IUser>(
  {
    firstName:{
      type: String,
      required: true
    },
    lastName:{
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this;

  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds)
  );

  next();
});


const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
