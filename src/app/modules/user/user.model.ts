// import mongoose, { Schema } from "mongoose";
// import { IUser, UserRole } from "./user.interface";

// const userSchema = new Schema<IUser>(
//   {
//     firstName: { type: String, required: true },
//     lastName: { type: String, required: true },
//     email: { type: String, required: true, unique: true, lowercase: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: Object.values(UserRole), required: true },
//     isActive: { type: Boolean, default: true },
//     // Simplified Referral System
//     referralCode: {
//       type: String,
//       unique: true,
//       index: true,
//       default: null,
//       required: false
//     },
//     referralLink: { type: String, default: null },
//     referredBy: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },
//     verified: {
//       type: Boolean,
//       default: false,
//     },
//     points: {
//       type: Number,
//       default: 0,
//     },
//     invitedUserCount: {
//       type: Number,
//       default: 0,
//     },
//     freePackages: [{
//       type: Schema.Types.ObjectId,
//       ref: "FreePackage"
//     }]
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true }
//   }
// );

// // Virtual for referral stats (computed on demand)
// userSchema.virtual("referralStats", {
//   ref: "Referral",
//   localField: "_id",
//   foreignField: "referrer",
//   justOne: false,
//   options: {
//     projection: {
//       status: 1,
//       rewardAmount: 1,
//       verifiedAt: 1,
//     },
//   },
// });

// // Virtual for referral count
// userSchema.virtual("referralCount", {
//   ref: "Referral",
//   localField: "_id",
//   foreignField: "referrer",
//   count: true,
// });

// // Virtual for referred users (list of users who used this user's referral code)
// userSchema.virtual("referredUsers", {
//   ref: "Referral",
//   localField: "_id",
//   foreignField: "referrer",
//   justOne: false,
//   options: {
//     populate: {
//       path: "referredUser",
//       select: "firstName lastName email role createdAt",
//     },
//     projection: {
//       referredUser: 1,
//       status: 1,
//       verifiedAt: 1,
//     },
//   },
// });

// // Password hashing (commented out as in original)
// // userSchema.pre("save", async function (next) {
// //   if (this.isModified("password")) {
// //     this.password = await bcrypt.hash(
// //       this.password,
// //       Number(config.bcrypt_salt_rounds)
// //     );
// //   }
// //   next();
// // });

// const UserModel = mongoose.model<IUser>("User", userSchema);
// export default UserModel;

import mongoose, { Schema } from "mongoose";
import { IUser, UserRole } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    isActive: { type: Boolean, default: true },
    referralCode: {
      type: String,
      unique: true,
      index: true,
      default: null,
      required: false,
    },
    referralLink: { type: String, default: null },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    points: {
      type: Number,
      default: 0,
    },
    invitedUserCount: {
      type: Number,
      default: 0,
    },
    freePackages: [
      {
        type: Schema.Types.ObjectId,
        ref: "FreePackage",
      },
    ],
    currentBadge: {
      type: Schema.Types.ObjectId,
      ref: "Badge",
      default: undefined,
    },
    autoAssignBadge: {
      type: Boolean,
      default: true,
    },
    subscriptions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subscription",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for referral stats (computed on demand)
userSchema.virtual("referralStats", {
  ref: "Referral",
  localField: "_id",
  foreignField: "referrer",
  justOne: false,
  options: {
    populate: {
      path: "referredUser",
      select: "firstName lastName email",
    },
    projection: {
      status: 1,
      rewardAmount: 1,
      verifiedAt: 1,
      referredUser: 1,
    },
  },
});

// Virtual for referral count
userSchema.virtual("referralCount", {
  ref: "Referral",
  localField: "_id",
  foreignField: "referrer",
  count: true,
});

// Virtual for referred users (list of users who used this user's referral code)
userSchema.virtual("referredUsers", {
  ref: "Referral",
  localField: "_id",
  foreignField: "referrer",
  justOne: false,
  options: {
    populate: {
      path: "referredUser",
      select: "firstName lastName email role createdAt",
    },
    projection: {
      referredUser: 1,
      status: 1,
      verifiedAt: 1,
    },
  },
});

// Password hashing (commented out as in original)
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
