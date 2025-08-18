import AppError from "../../errors/appError";
import status from "http-status";
import { PostModel } from "./post.model";
import { IPost } from "./post.interface";
import { IUser } from "../user/user.interface";
import { Types } from "mongoose";
import ProofModel from "../proof/otherProof/proof.model";
import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../utils/paginationHelpers";

/**
 * Create a new post
 */
const createPost = async (payload: IPost, user: IUser) => {
  const updatedPayload = {
    ...payload,
    authorId: user?.id,
  };
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

  // 2. Create new proof document
  const proof = await ProofModel.create({
    PostId: new Types.ObjectId(post?._id),
    proofSubmittedBy: userId,
    proofType: payload.proofType,
    proofLink: payload.proofLink,
    proofAbout: payload.proofAbout,
    status: "pending",
  });

  console.log("proof", proof)

  const checkProofAlreaySubmitted = post.proofs.includes(proof?._id);
  if (checkProofAlreaySubmitted) {
    throw new AppError(status.CONFLICT, "Proof already submitted");
  }

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
