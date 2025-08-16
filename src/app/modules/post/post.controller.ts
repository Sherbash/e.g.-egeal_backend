import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { PostService } from "./post.services";
import { IUser } from "../user/user.interface";
import { Types } from "mongoose";
import pickOptions from "../../utils/pick";

// Create a post
const createPost = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;
  const result = await PostService.createPost(payload, user as IUser);

  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "Post created successfully",
    data: result,
  });
});

const submitProof = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = req.user?.id;
  const payload = req.body;

  const result = await PostService.submitProofToPost(postId, userId, payload);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Proof submitted and assigned to post successfully",
    data: result,
  });
});
// Get a post by ID
const getPost = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.id;
  const result = await PostService.getPostById(postId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Post fetched successfully",
    data: result,
  });
});

// Get all posts (optionally filtered by author)
const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const options = pickOptions(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortOrder",
  ]);
  const authorId = req.user?.id;
  const result = await PostService.getAllPosts(authorId, options);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Posts fetched successfully",
    data: result,
  });
});

// Update a post
const updatePost = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.id;
  const payload = req.body;
  const result = await PostService.updatePost(postId, payload, req.user as IUser);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Post updated successfully",
    data: result,
  });
});

// Delete a post
const deletePost = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.id;
  await PostService.deletePost(postId , req.user as IUser);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Post deleted successfully",
    data: null,
  });
});

export const PostController = {
  createPost,
  submitProof,
  getPost,
  getAllPosts,
  updatePost,
  deletePost,
};
