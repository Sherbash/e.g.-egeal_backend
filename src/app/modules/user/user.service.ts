

import bcrypt from "bcrypt";
import { IUser, UserRole } from "./user.interface";
import mongoose from "mongoose";
import UserModel from "./user.model";
import AppError from "../../errors/appError";
import status from "http-status";
import { TempUserModel } from "../otp/tempUser.model";
import generateNumericNanoid from "../../utils/createNanoId";
import config from "../../config";
import { createAndSendOtp, verifyOtp } from "../otp/otp.service";
import { Referral } from "../referral/referral.model";
import { generateUniqueId } from "../../utils/generateUniqueSlug";
import { Influencer } from "../influencer/influencer.model";
import { Founder } from "../founder/founder.model";
import { Investor } from "../investor/investor.model";
import { IJwtPayload } from "../auth/auth.interface";
import { findProfileByRole } from "../../utils/findUser";

// const registerUser = async (payload: IUser) => {
//   const {
//     email,
//     role,
//     password,
//     firstName,
//     lastName,
//     additionalNotes,
//     referredBy,
//     referralCode,
//   } = payload;

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // 1. Check if user exists in User or TempUser
//     const existingUser = await UserModel.findOne({ email }).session(session);
//     if (existingUser) {
//       throw new AppError(status.BAD_REQUEST, "Email already registered");
//     }
//     const existingTempUser = await TempUserModel.findOne({ email }).session(
//       session
//     );
//     if (existingTempUser) {
//       throw new AppError(status.BAD_REQUEST, "Email awaiting OTP verification");
//     }

//     // 2. Validate referrer
//     let referrerUser = null;
//     if (referredBy) {
//       referrerUser = await UserModel.findById(referredBy).session(session);
//       if (!referrerUser)
//         throw new AppError(status.BAD_REQUEST, "Referrer user not found");
//     } else if (referralCode) {
//       referrerUser = await UserModel.findOne({ referralCode }).session(session);
//       // if (!referrerUser)
//       //   throw new AppError(status.BAD_REQUEST, "Invalid referral code");
//     }

//     // 3. Generate new referral code for this user
//     const newReferralCode = generateNumericNanoid(10);

//     // 4. Create referral link for this user
//     const newReferralLink = `${process.env.CLIENT_URL}/register?referralCode=${newReferralCode}`;

//     // 5. Hash password
//     const hashedPassword = await bcrypt.hash(
//       password,
//       Number(config.bcrypt_salt_rounds)
//     );

//     // 6. Store temporary user data
//     const tempUserData = {
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       role,
//       additionalNotes,
//       referredBy: referrerUser?._id || undefined,
//       referralCode: newReferralCode,
//       referralLink: newReferralLink,
//     };

//     await TempUserModel.create([tempUserData], { session });

//     // 7. Send OTP
//     await createAndSendOtp(email, firstName);

//     await session.commitTransaction();

//     return {
//       message: "OTP sent to your email. Please verify to complete signup.",
//     };
//   } catch (error) {
//     await session.abortTransaction();
//     throw error;
//   } finally {
//     session.endSession();
//   }
// };

const registerUser = async (payload: IUser) => {
  const {
    email,
    role,
    password,
    firstName,
    lastName,
    additionalNotes,
    referredBy,
    referralCode,
  } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check if user exists in User or TempUser
    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser) {
      throw new AppError(status.BAD_REQUEST, "Email already registered");
    }

    const existingTempUser = await TempUserModel.findOne({ email }).session(
      session
    );
    if (existingTempUser) {
      throw new AppError(status.BAD_REQUEST, "Email awaiting OTP verification");
    }

    // 2. Validate referrer
    let referrerUser = null;
    if (referredBy) {
      referrerUser = await UserModel.findById(referredBy).session(session);
      if (!referrerUser)
        throw new AppError(status.BAD_REQUEST, "Referrer user not found");
    } else if (referralCode) {
      referrerUser = await UserModel.findOne({ referralCode }).session(session);
      // if (!referrerUser)
      //   throw new AppError(status.BAD_REQUEST, "Invalid referral code");
    }

    // 3. Generate new referral code for this user
    const newReferralCode = generateNumericNanoid(10);

    // 4. Create referral link
    const newReferralLink = `${process.env.CLIENT_URL}/signup?referralCode=${newReferralCode}`;

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds)
    );

    // 6. Store temporary user data
    const tempUserData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      additionalNotes,
      referredBy: referrerUser?._id || undefined,
      referralCode: newReferralCode,
      referralLink: newReferralLink,
    };

    await TempUserModel.create([tempUserData], { session });

    // 7. Send OTP
    await createAndSendOtp(email, firstName);

    await session.commitTransaction();

    return {
      message: "OTP sent to your email. Please verify to complete signup.",
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
const completeRegistration = async (email: string, otp: string) => {
  // if (!email || !otp) {
  //   throw new AppError(status.BAD_REQUEST, "Email and OTP required!");
  // }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Verify OTP
    await verifyOtp(email, otp);

    // 2. Find temporary user data
    const tempUser = await TempUserModel.findOne({ email }).session(session);
    if (!tempUser) {
      throw new AppError(
        status.BAD_REQUEST,
        "No pending signup found for this email"
      );
    }

    // 3. Create user record
    const userData = {
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      email: tempUser.email,
      password: tempUser.password, // Already hashed
      role: tempUser.role,
      isActive: true,
      additionalNotes: tempUser.additionalNotes,
      referredBy: tempUser.referredBy,
      referralCode: tempUser.referralCode,
      referralLink: tempUser.referralLink,
    };

    const [newUser] = await UserModel.create([userData], { session });

    // 4. If there’s a referrer, create referral record
    if (tempUser.referredBy) {
      console.log("tempUser.referredBy", tempUser.referredBy)
      await Referral.create(
        [
          {
            referrer: tempUser.referredBy,
            referredUser: newUser._id,
            status: "pending",
            rewardAmount: null,
          },
        ],
        { session }
      );

      await UserModel.updateOne(
        { _id: tempUser.referredBy },
        { $inc: { points: 1 , invitedUserCount: 1 } },
        { session }
      );
    }

    // 5. Role-specific profile creation
    let roleProfile;
    const roleData = {
      userId: newUser._id,
      additionalNotes: tempUser.additionalNotes || "empty",
    };

    switch (tempUser.role) {
      case UserRole.INFLUENCER:
        const influencerId = await generateUniqueId(
          `${tempUser.firstName}${tempUser.lastName}`,
          Influencer,
          "influencerId"
        );
        roleProfile = await Influencer.create([{ ...roleData, influencerId }], {
          session,
        });
        break;
      case UserRole.FOUNDER:
        roleProfile = await Founder.create([roleData], { session });
        break;
      case UserRole.INVESTOR:
        roleProfile = await Investor.create([roleData], { session });
        break;
      case UserRole.USER:
        break;
      default:
        throw new AppError(status.BAD_REQUEST, "Invalid role");
    }

    // 6. Delete temporary user data
    await TempUserModel.deleteOne({ email }).session(session);

    await session.commitTransaction();

    return {
      user: {
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        referralCode: newUser.referralCode,
        referralLink: newUser.referralLink,
        referredBy: newUser.referredBy,
      },
      profile: roleProfile?.[0],
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllUsers = async (filters: any) => {
  const {
    searchTerm,
    role,
    isActive,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const query: any = {};

  // Search by name or email
  if (searchTerm) {
    query.$or = [
      { firstName: { $regex: searchTerm, $options: "i" } },
      { lastName: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
    ];
  }

  // Filter by role
  if (role) {
    query.role = role;
  }

  // Filter by active status
  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const users = await UserModel.find(query)
    .populate("referralCount")
    .populate("referralStats")
    .select("-password")
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // Fetch role-specific data for each user
  const usersWithRoleData = await Promise.all(
    users.map(async (user) => {
      let roleData = null;

      switch (user.role) {
        case UserRole.ADMIN:
          roleData = await UserModel.findOne({ userId: user._id }).populate(
            "userId"
          );
          break;
        case UserRole.USER:
          roleData = await UserModel.findOne({ userId: user._id }).populate(
            "userId"
          );
          break;
        case UserRole.INFLUENCER:
          roleData = await Influencer.findOne({ userId: user._id }).lean();
          break;
        case UserRole.FOUNDER:
          roleData = await Founder.findOne({ userId: user._id }).lean();
          break;
        case UserRole.INVESTOR:
          roleData = await Investor.findOne({ userId: user._id }).lean();
          break;
      }
      return {
        ...user,
        roleData,
      };
    })
  );

  const total = await UserModel.countDocuments(query);

  return {
    users: usersWithRoleData,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getSingleUser = async (id: string) => {
  const user = await UserModel.findById(id)
    .populate("referralCount")
    .populate("referralStats")
    .select("-password")
    .lean();

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found!");
  }

  // Fetch role-specific data
  let roleData = null;

  switch (user.role) {
    case UserRole.INFLUENCER:
      roleData = await Influencer.findOne({ userId: user._id }).lean();
      break;
    case UserRole.FOUNDER:
      roleData = await Founder.findOne({ userId: user._id }).lean();
      break;
    case UserRole.INVESTOR:
      roleData = await Investor.findOne({ userId: user._id }).lean();
      break;
  }

  return {
    ...user,
    roleData,
  };
};

const updateUser = async (id: string, payload: any) => {
  const { email, password, roleData, ...updateData } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if user exists
    const existingUser = await UserModel.findById(id).session(session);
    if (!existingUser) {
      throw new AppError(status.NOT_FOUND, "User not found!");
    }

    // If email is being updated, check for duplicates
    if (email && email !== existingUser.email) {
      const emailExists = await UserModel.findOne({
        email,
        _id: { $ne: id },
      }).session(session);
      if (emailExists) {
        throw new AppError(status.BAD_REQUEST, "This email is already in use!");
      }
    }

    // If password is being updated, hash it
    if (password) {
      updateData.password = await bcrypt.hash(
        password,
        Number(config.bcrypt_salt_rounds)
      );
    }

    // Update user data
    const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      session,
    }).select("-password");

    // Update role-specific data if provided
    if (roleData) {
      switch (existingUser.role) {
        case UserRole.INFLUENCER:
          await Influencer.findOneAndUpdate({ userId: id }, roleData, {
            new: true,
            runValidators: true,
            session,
          });
          break;
        case UserRole.FOUNDER:
          await Founder.findOneAndUpdate({ userId: id }, roleData, {
            new: true,
            runValidators: true,
            session,
          });
          break;
        case UserRole.INVESTOR:
          await Investor.findOneAndUpdate({ userId: id }, roleData, {
            new: true,
            runValidators: true,
            session,
          });
          break;
      }
    }

    await session.commitTransaction();

    // Fetch updated role data
    let updatedRoleData = null;
    switch (existingUser.role) {
      case UserRole.INFLUENCER:
        updatedRoleData = await Influencer.findOne({ userId: id }).lean();
        break;
      case UserRole.FOUNDER:
        updatedRoleData = await Founder.findOne({ userId: id }).lean();
        break;
      case UserRole.INVESTOR:
        updatedRoleData = await Investor.findOne({ userId: id }).lean();
        break;
    }

    return {
      ...updatedUser,
      roleData: updatedRoleData,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const deleteUser = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if user exists
    const user = await UserModel.findById(id).session(session);
    if (!user) {
      throw new AppError(status.NOT_FOUND, "User not found!");
    }

    // Delete role-specific data based on user role
    switch (user.role) {
      case UserRole.INFLUENCER:
        await Influencer.findOneAndDelete({ userId: id }).session(session);
        break;
      case UserRole.FOUNDER:
        await Founder.findOneAndDelete({ userId: id }).session(session);
        break;
      case UserRole.INVESTOR:
        await Investor.findOneAndDelete({ userId: id }).session(session);
        break;
    }

    // Delete the user
    const deletedUser = await UserModel.findByIdAndDelete(id).session(session);

    await session.commitTransaction();

    return { message: "User and associated data deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const myProfile = async (authUser: IJwtPayload) => {
  const isUserExists = await UserModel.findById(authUser.id)
    .populate("referralCount")
    .populate("referralStats")
    .select("-password");
  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found!");
  }
  if (!isUserExists.isActive) {
    throw new AppError(status.BAD_REQUEST, "User is not active!");
  }

  const profile = await UserModel.findOne({ user: isUserExists._id });

  return {
    ...isUserExists,
    profile: profile || null,
  };
};

const getMeRoleBasedInfo = async (user: IUser) => {
  const profile = await findProfileByRole(user);
  return profile;
};

const toggleUserStatus = async (userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the user
    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new AppError(status.NOT_FOUND, "User not found!");
    }

    // Toggle the isActive status
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isActive: !user.isActive },
      { new: true, session }
    ).select("-password");

    if (!updatedUser) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        "Failed to update user status"
      );
    }

    await session.commitTransaction();

    return {
      message: `User ${
        updatedUser.isActive ? "activated" : "banned"
      } successfully`,
      user: updatedUser,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const UserServices = {
  registerUser,
  completeRegistration,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  myProfile,
  getMeRoleBasedInfo,
  toggleUserStatus,
};
