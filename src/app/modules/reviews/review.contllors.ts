import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { reviewServices } from "./review.services";
import pickOptions from "../../utils/pick";

const CreateReview = catchAsync(async (req, res) => {
  const user = req.user;

  const userName = `${user?.firstName} ${user.lastName}`;

  const reviewData = { ...req.body, userName: userName, userId: user.id };
  console.log("check review data", reviewData);
  const result = await reviewServices.createReviewForDb(reviewData);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "reviews successfully created !",
    data: result,
  });
});
const getAllReview = catchAsync(async (req, res) => {
  const options = pickOptions(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortOrder",
  ]);
  const filters = pickOptions(req.query, [
    "rating",
  ]);
  const result = await reviewServices.getAllReviewForDb(options, filters);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All reviews successfully get !",
    data: result,
  });
});
const getSingleReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await reviewServices.getSingleReviewForDb(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "single review successfully get !",
    data: result,
  });
});
const UpdateReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await reviewServices.updateSingleReviewForDb(id, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "reviews successfully updated !",
    data: result,
  });
});
const DeleteReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  await reviewServices.deleteReviewForDb(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "reviews successfully deleted !",
  });
});
const GetToolReviews = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await reviewServices.getToolReviewForDb(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Tool reviews successfully get !",
    data: result,
  });
});

export const ReviewContllors = {
  CreateReview,
  getAllReview,
  getSingleReview,
  UpdateReview,
  DeleteReview,
  GetToolReviews,
};
