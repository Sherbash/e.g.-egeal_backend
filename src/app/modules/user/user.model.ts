// import mongoose, { Schema } from "mongoose";
// import { IUser, UserRole } from "./user.interface";
// import bcrypt from "bcrypt";
// import config from "../../config";

// // Create the User schema based on the interface
// const userSchema = new Schema<IUser>(
//   {

//     firstName:{
//       type: String,
//       required: true
//     },
//     lastName:{
//       type: String,
//       required: true
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     role: {
//       type: String,
//       enum: Object.values(UserRole),
//       required: true,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     }
//   },
//   {
//     timestamps: true,
//   }
// );

// userSchema.pre("save", async function (next) {
//   const user = this;

//   user.password = await bcrypt.hash(
//     user.password,
//     Number(config.bcrypt_salt_rounds)
//   );

//   next();
// });

// const UserModel = mongoose.model<IUser>("User", userSchema);
// export default UserModel;

// user.model.ts
import mongoose, { Schema } from "mongoose";
import { IUser, UserRole } from "./user.interface";
import bcrypt from "bcrypt";
import config from "../../config";
import { nanoid } from "nanoid";

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    isActive: { type: Boolean, default: true },

    // Referral system fields
    referralCode: { type: String, unique: true }, // unique code for link
    referredBy: { type: Schema.Types.ObjectId, ref: "User" }, // who referred them
    points: { type: Number, default: 0 }, // or payout balance in currency
  },
  { timestamps: true }
);

// Auto-generate referral code when creating user
userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.referralCode) {
    user.referralCode = nanoid(8); // short unique code
  }

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds)
    );
  }

  next();
});

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
