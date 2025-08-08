import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import pickOptions from "../../utils/pick";
import { InfluencerService } from "./founder.service";

const getAllInfluencer = catchAsync(async (req, res) => {
  const options = pickOptions(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortOrder",
  ]);
  const filters = pickOptions(req.query, [
    "searchTerm",
  ]);
  const result = await InfluencerService.getAllInfluencer(options, filters);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Retrieved all influencers successfully!",
    data: result,
  });
});

export const InfluencerController = {
  getAllInfluencer,
};