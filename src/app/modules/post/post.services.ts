import AppError from "../../errors/appError";
import status from "http-status";
import { PostModel } from "./post.model";
import { IPost } from "./post.interface";
import { IUser } from "../user/user.interface";
import { Types } from "mongoose";
import ProofModel from "../proof/otherProof/proof.model";
import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../utils/paginationHelpers";
import { sendEmail } from "../../utils/emailHelper";

/**
 * Create a new post
 */
const createPost = async (payload: IPost, user: IUser) => {
  const updatedPayload = {
    ...payload,
    authorId: user?.id,
  };
  await sendEmail(
    user.email,
    "🎉 Job Created Successfully",
    `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      <div style="max-width: 600px; background-color: #ffffff; margin: auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background-color: #4CAF50; color: white; padding: 15px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">✅ Job Created Successfully</h1>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 16px; color: #333;">
            Hello <strong>${user.firstName || "User"}</strong>,
          </p>
          <p style="font-size: 15px; color: #555;">
            We’re excited to let you know that your job has been successfully created in our system.  
            Our team will review and keep you updated on the progress.
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${`${process.env.CLIENT_URL}/dashboard/create-job`}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Your Jobs
            </a>
          </div>
          <p style="font-size: 14px; color: #888;">
            If you have any questions, feel free to reply to this email.  
          </p>
          <p style="font-size: 14px; color: #333; margin-top: 20px;">
            Best regards,  
            <br>
            <strong>Egeal AI Hub Team</strong>
          </p>
        </div>
      </div>
    </div>
  `
  );
  const post = await PostModel.create(updatedPayload);
  return post;
};

/**
 * Get a post by ID
 */
const getPostById = async (postId: string) => {
  const post = await PostModel.findById(postId)
    .populate("authorId", "firstName lastName email role isActive verified")
    .populate("proofs");

  if (!post) {
    throw new AppError(status.NOT_FOUND, "Post not found");
  }
  return post;
};

/**
 * Submit proof and assign to post
 */
const submitProofToPost = async (
  postId: string,
  userId: string,
  payload: {
    proofLink: string;
    proofAbout: string;
    proofType: string;
  }
) => {
  // 1. Verify the post exists
  const post = await PostModel.findById(postId);
  if (!post) {
    throw new AppError(status.NOT_FOUND, "Post not found");
  }

  const isAlreadyExists = await ProofModel.findOne({
    proofSubmittedBy: userId,
    proofType: "post",
  });

  if (isAlreadyExists) {
    throw new AppError(status.CONFLICT, "You have already submitted a proof");
  }

  // 2. Create new proof document
  const proof = await ProofModel.create({
    PostId: new Types.ObjectId(post?._id),
    proofSubmittedBy: userId,
    proofType: payload.proofType,
    proofLink: payload.proofLink,
    proofAbout: payload.proofAbout,
    status: "pending",
  });

  // console.log("proof", proof)

  // 3. Assign proof to post
  post.proofs.push(proof?._id);
  await post.save();

  // 4. Return populated result
  const result = await PostModel.findById(postId)
    .populate("authorId", "firstName lastName email")
    .populate({
      path: "proofs",
      populate: { path: "proofSubmittedBy", select: "firstName lastName" },
    });

  return result;
};
/**
 * Get all posts (with optional author filter)
 */
const getAllPosts = async (authorId: string, options: IPaginationOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const query = authorId ? { authorId } : {};
  const posts = await PostModel.find(query)
    .populate("authorId", "firstName lastName email role isActive verified")
    .populate("proofs")
    .lean()
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
  const total = await PostModel.countDocuments(query);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: posts,
  };
};

/**
 * Update a post
 */
/**
 * Update a post with proper validation and role-based access
 */
const updatePost = async (
  postId: string,
  payload: Partial<IPost>,
  user: IUser
) => {
  // 1. Verify the post exists
  const post = await PostModel.findById(postId);
  if (!post) {
    throw new AppError(status.NOT_FOUND, "Post not found");
  }

  // 2. Authorization check - only author or admin can update
  const isAuthor = post?.authorId.toString() === user?.id?.toString();
  const isAdmin = user.role === "admin";

  if (!isAuthor && !isAdmin) {
    throw new AppError(
      status.FORBIDDEN,
      "Only post author or admin can update this post"
    );
  }

  // 3. Prevent updating certain fields if not admin
  if (!isAdmin) {
    const restrictedFields = ["proofs", "authorId"];
    restrictedFields.forEach((field) => {
      if (payload[field as keyof IPost] !== undefined) {
        throw new AppError(
          status.FORBIDDEN,
          `Only admin can update ${field} field`
        );
      }
    });
  }

  // 4. Handle proofs array updates properly
  if (payload.proofs && Array.isArray(payload.proofs)) {
    // Verify all proof IDs exist
    const existingProofs = await ProofModel.countDocuments({
      _id: { $in: payload.proofs },
    });

    if (existingProofs !== payload.proofs.length) {
      throw new AppError(
        status.BAD_REQUEST,
        "One or more proof IDs are invalid"
      );
    }
  }

  // 5. Perform the update
  const updatedPost = await PostModel.findByIdAndUpdate(postId, payload, {
    new: true,
    runValidators: true,
  })
    .populate("authorId", "firstName lastName email role isActive verified")
    .populate("proofs");

  if (!updatedPost) {
    throw new AppError(status.NOT_FOUND, "Post not found after update");
  }

  return updatedPost;
};

/**
 * Delete a post
 */
const deletePost = async (postId: string, user: IUser) => {
  // 1. Verify the post exists
  const post = await PostModel.findById(postId);
  if (!post) {
    throw new AppError(status.NOT_FOUND, "Post not found");
  }

  // 2. Authorization check - only author or admin can delete
  const isAuthor = post?.authorId.toString() === user?.id?.toString();
  const isAdmin = user.role === "admin";

  if (!isAuthor && !isAdmin) {
    throw new AppError(
      status.FORBIDDEN,
      "Only post author or admin can delete this post"
    );
  }
  // 2. Delete the post
  const result = await PostModel.findByIdAndDelete(postId);
  if (!result) {
    throw new AppError(status.NOT_FOUND, "Post not found");
  }

  await ProofModel.deleteMany({ _id: { $in: post.proofs } });
  return null;
};

export const PostService = {
  createPost,
  submitProofToPost,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
};
