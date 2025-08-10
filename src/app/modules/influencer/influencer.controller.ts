import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import pickOptions from "../../utils/pick";
import { InfluencerService } from "./influencer.service";

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

const createGigPage = catchAsync(async (req, res) => {
  const result = await InfluencerService.createGigPage(req.user.id, req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Gig page created successfully",
    data: result,
  });
});

const getGigPage = catchAsync(async (req, res) => {
  const result = await InfluencerService.getGigPage(req.params.username);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Gig page retrieved successfully",
    data: result,
  });
});

const updateGigPage = catchAsync(async (req, res) => {
  const result = await InfluencerService.updateGigPage(req.user.id, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Gig page updated successfully",
    data: result,
  });
});

const deleteGigPage = catchAsync(async (req, res) => {
  const result = await InfluencerService.deleteGigPage(req.user.id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Gig page deleted successfully",
    data: result,
  });
});

export const InfluencerController = {
  getAllInfluencer,
  createGigPage,
  getGigPage,
  updateGigPage,
  deleteGigPage
};