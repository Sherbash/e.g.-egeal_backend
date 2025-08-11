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
  const filters = pickOptions(req.query, ["searchTerm"]);
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

const getGigPageById = catchAsync(async (req, res) => {
  const result = await InfluencerService.getGigPageById(req.params.id);
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
  await InfluencerService.deleteGigPage(req.user.id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Gig page deleted successfully",
    data: null,
  });
});

// ✅ Create or Update Bank Details
const upsertBankDetails = catchAsync(async (req, res) => {
  const { influencerId } = req.params;
  const bankDetails = req.body;

  const result = await InfluencerService.upsertBankDetails(
    influencerId,
    bankDetails
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Bank details updated successfully",
    data: result,
  });
});

// ✅ Get Bank Details
const getBankDetails = catchAsync(async (req, res) => {
  const { influencerId } = req.params;

  const result = await InfluencerService.getBankDetails(influencerId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Bank details retrieved successfully",
    data: result,
  });
});

// ✅ Delete Bank Details
const deleteBankDetails = catchAsync(async (req, res) => {
  const { influencerId } = req.params;

  const result = await InfluencerService.deleteBankDetails(influencerId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Bank details deleted successfully",
    data: result,
  });
});

export const InfluencerController = {
  getAllInfluencer,
  createGigPage,
  getGigPage,
  updateGigPage,
  deleteGigPage,
  getGigPageById,
  upsertBankDetails,
  getBankDetails,
  deleteBankDetails,
};
