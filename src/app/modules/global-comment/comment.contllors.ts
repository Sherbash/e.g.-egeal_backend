import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { commentServices } from "./comment.services";
import pickOptions from "../../utils/pick";


// Comment Controllers
const CreateComment = catchAsync(async (req, res) => {
  const payload = req.body;
  // console.log("comment payload", payload)
  const result = await commentServices.createCommentForDb(payload, req.user.id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Comment successfully created!",
    data: result,
  });
});

const GetAllCommentsByEntityId = catchAsync(async (req, res) => {
  const options = pickOptions(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortOrder",
  ]);

  const entityId = req.params.entityId

  const result = await commentServices.getAllCommentsForDb(options,entityId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Comments successfully retrieved!",
    data: result,
  });
});

const GetSingleComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await commentServices.getSingleCommentForDb(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Comment successfully retrieved!",
    data: result,
  });
});

const UpdateComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await commentServices.updateSingleCommentForDb(id, payload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Comment successfully updated!",
    data: result,
  });
});

const DeleteComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  await commentServices.deleteCommentForDb(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Comment successfully deleted!",
  });
});

export const CommentControllers = {
  CreateComment,
  GetAllCommentsByEntityId,
  GetSingleComment,
  UpdateComment,
  DeleteComment,
};
