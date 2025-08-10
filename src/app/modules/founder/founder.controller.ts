import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { FounderService } from "./founder.service";
import pickOptions from "../../utils/pick";

const getAllFounder = catchAsync(async (req, res) => {
const options = pickOptions(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortOrder",
  ]);
  const filters = pickOptions(req.query, [
    "searchTerm",
  ]);
  const result = await FounderService.getAllFounder(options, filters);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Retrieved all founders successfully!",
    data: result,
  });
});

export const FounderController = {
  getAllFounder,
};
