import mongoose, { Schema } from "mongoose";
import { IUser, UserRole } from "./user.interface";
import bcrypt from "bcrypt";
import config from "../../config";

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    isActive: { type: Boolean, default: true },

    // Simplified Referral System
    referralCode: {
      type: String,
      unique: true,
      index: true,
      default: null,
    },
    referralLink: { type: String, default: null },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Password hashing
// userSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(
//       this.password,
//       Number(config.bcrypt_salt_rounds)
//     );
//   }
//   next();
// });

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
