import { IUser, UserRole } from "./user.interface";
import AppError from "../../errors/appError";
import status from "http-status";
import User from "./user.model";
import mongoose from "mongoose";
import { Influencer } from "../influencer/influencer.model";
import { Founder } from "../founder/founder.model";
import { Investor } from "../investor/investor.model";
import { generateUniqueId } from "../../utils/generateUniqueSlug";
import bcrypt from 'bcrypt';
import config from "../../config";
import { IJwtPayload } from "../auth/auth.interface";
import { findProfileByRole } from "../../utils/findUser";


const registerUser = async (payload: IUser) => {
  const { email, role, password, firstName, lastName, additionalNotes } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if user already exists
    const checkExistingUser = await User.findOne({ email }).session(session);
    if (checkExistingUser) {
      throw new AppError(status.BAD_REQUEST, "This email is already in use!");
    }

    // Prepare user data
    const userData: Partial<IUser> = {
      firstName,
      lastName,
      email,
      password,
      role,
      isActive: true,
      additionalNotes: additionalNotes || undefined,
    };

    // Create user
    const [createdUser] = await User.create([userData], { session });

    // Prepare response object
    const response: any = {
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      role: createdUser.role,
      _id: createdUser._id,
      isActive: createdUser.isActive,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
      additionalNotes: createdUser.additionalNotes,
    };

    const fullName = `${payload.firstName}${payload.lastName}`;
    const influencerId = await generateUniqueId(fullName, Influencer, "influencerId");

    // Create role-specific data based on user role and include in response
    switch (role) {
      case UserRole.INFLUENCER:
        const influencerData = {
          userId: createdUser._id,
          influencerId, // Use User's _id as userId
          affiliations: [],
          additionalNotes: additionalNotes || "empty",
        };
        const [createdInfluencer] = await Influencer.create([influencerData], { session });
        response.influencerData = {
          _id: createdInfluencer._id,
          userId: createdInfluencer.userId,
          influencerId,
          affiliations: createdInfluencer.affiliations,
          additionalNotes: createdInfluencer.additionalNotes,
          createdAt: createdInfluencer.createdAt,
          updatedAt: createdInfluencer.updatedAt,
        };
        break;

      case UserRole.FOUNDER:
        const founderData = {
          userId: createdUser._id, // Use User's _id as userId
          tools: [],
          additionalNotes: additionalNotes || "empty",
        };
        const [createdFounder] = await Founder.create([founderData], { session });
        response.founderData = {
          _id: createdFounder._id,
          userId: createdFounder.userId,
          tools: createdFounder.tools,
          additionalNotes: createdFounder.additionalNotes,
          createdAt: createdFounder.createdAt,
          updatedAt: createdFounder.updatedAt,
        };
        break;

      case UserRole.INVESTOR:
        const investorData = {
          userId: createdUser._id, // Use User's _id as userId
          investIn: [],
          additionalNotes: additionalNotes || "empty",
        };
        const [createdInvestor] = await Investor.create([investorData], { session });
        response.investorData = {
          _id: createdInvestor._id,
          userId: createdInvestor.userId,
          investIn: createdInvestor.investIn,
          projectPreference: createdInvestor.projectPreference,
          investmentRange: createdInvestor.investmentRange,
          additionalNotes: createdInvestor.additionalNotes,
          createdAt: createdInvestor.createdAt,
          updatedAt: createdInvestor.updatedAt,
        };
        break;

      case UserRole.USER:
        // No role-specific data for 'user' role
        break;

      default:
        throw new AppError(status.BAD_REQUEST, "Invalid user role");
    }

    // Commit the transaction
    await session.commitTransaction();

    return response;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


// Add to user.service.ts
const getAllUsers = async (filters: any) => {
  const { searchTerm, role, isActive, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
  
  const query: any = {};
  
  // Search by name or email
  if (searchTerm) {
    query.$or = [
      { firstName: { $regex: searchTerm, $options: 'i' } },
      { lastName: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  // Filter by role
  if (role) {
    query.role = role;
  }
  
  // Filter by active status
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  const users = await User.find(query)
    .select('-password')
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit))
    .lean();
    
  // Fetch role-specific data for each user
  const usersWithRoleData = await Promise.all(
    users.map(async (user) => {
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
        roleData
      };
    })
  );
    
  const total = await User.countDocuments(query);
  
  return {
    users: usersWithRoleData,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  };
};



// Add to user.service.ts
const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select('-password');
  
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
    ...user.toObject(),
    roleData
  };
};


// Add to user.service.ts
// Add to user.service.ts
const updateUser = async (id: string, payload: any) => {
  const { email, password, roleData, ...updateData } = payload;
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Check if user exists
    const existingUser = await User.findById(id).session(session);
    if (!existingUser) {
      throw new AppError(status.NOT_FOUND, "User not found!");
    }
    
    // If email is being updated, check for duplicates
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: id } }).session(session);
      if (emailExists) {
        throw new AppError(status.BAD_REQUEST, "This email is already in use!");
      }
    }
    
    // If password is being updated, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
    }
    
    // Update user data
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true, session }
    ).select('-password');
    
    // Update role-specific data if provided
    if (roleData) {
      switch (existingUser.role) {
        case UserRole.INFLUENCER:
          await Influencer.findOneAndUpdate(
            { userId: id },
            roleData,
            { new: true, runValidators: true, session }
          );
          break;
        case UserRole.FOUNDER:
          await Founder.findOneAndUpdate(
            { userId: id },
            roleData,
            { new: true, runValidators: true, session }
          );
          break;
        case UserRole.INVESTOR:
          await Investor.findOneAndUpdate(
            { userId: id },
            roleData,
            { new: true, runValidators: true, session }
          );
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
      ...updatedUser?.toObject(),
      roleData: updatedRoleData
    };
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


// Add to user.service.ts
const deleteUser = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Check if user exists
    const user = await User.findById(id).session(session);
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
    const deletedUser = await User.findByIdAndDelete(id).session(session);
    
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
   const isUserExists = await User.findById(authUser.id);
   if (!isUserExists) {
      throw new AppError(status.NOT_FOUND, "User not found!");
   }
   if (!isUserExists.isActive) {
      throw new AppError(status.BAD_REQUEST, "User is not active!");
   }

   const profile = await User.findOne({ user: isUserExists._id });


   return {
      ...isUserExists.toObject(),
      profile: profile || null
   }

}

const getMeRoleBasedInfo = async (user: IUser) => {
   const profile = await findProfileByRole(user);
   return profile;

}

export const UserServices = {
  registerUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  myProfile,
  getMeRoleBasedInfo
};
