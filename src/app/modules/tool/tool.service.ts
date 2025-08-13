import status from "http-status";
import AppError from "../../errors/appError";
import { ToolModel } from "./tool.model";
import { ITool, IToolUpdate } from "./tool.interface";
import { generateUniqueId } from "../../utils/generateUniqueSlug";
import { Founder } from "../founder/founder.model";
import mongoose from "mongoose";
import { IUser } from "../user/user.interface";
import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../utils/paginationHelpers";

const createToolIntoDB = async (payload: ITool, user: IUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const founder = await Founder.findOne({ userId: user?.id }).session(
      session
    );
    // 1. Generate unique toolId
    const toolId = await generateUniqueId(payload.name, ToolModel, "toolId");

    // console.log("founder", founder)
    // 2. Prepare tool data
    const toolData = {
      ...payload,
      founderId: founder?._id,
      toolId,
      isActive: payload.isActive ?? true,
    };

    // 3. Check for existing tool with same name
    const existingTool = await ToolModel.findOne({
      name: toolData.name,
      isActive: true,
    }).session(session);

    if (existingTool) {
      throw new AppError(
        status.BAD_REQUEST,
        "A tool with this name already exists"
      );
    }

    // 4. Create the tool
    const createdTool = await ToolModel.create([toolData], { session });

    // 5. Update founder's tools array
    await Founder.findByIdAndUpdate(
      payload.founderId,
      {
        $addToSet: { tools: createdTool[0].toolId }, // Add toolId string
        $setOnInsert: { additionalNotes: "empty" }, // Set default if creating new
      },
      {
        session,
        upsert: true, // Create founder if doesn't exist
        new: true,
      }
    );

    await session.commitTransaction();
    return createdTool[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllToolsFromDB = async (
  paginationOptions: IPaginationOptions,
  filters: { searchTerm?: string; isActive?: boolean; launched?: boolean }
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  // Base query for active tools
  const query: any = {};

  // Search functionality
  if (filters.searchTerm) {
    query.$or = [
      { name: { $regex: filters.searchTerm, $options: "i" } },
      { description: { $regex: filters.searchTerm, $options: "i" } },
      { toolId: { $regex: filters.searchTerm, $options: "i" } },
    ];
  }

  // Price filter
  if (filters.isActive) {
    query.isActive = filters.isActive;
  }

  // Price filter
  if (filters.launched) {
    query.launched = filters.launched;
  }

  const tools = await ToolModel.find(query)
    .lean()
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  const total = await ToolModel.countDocuments(query);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: tools,
  };
};

const getSingleToolFromDB = async (id: string) => {
  const tool = await ToolModel.findById(id).lean();
  if (!tool || !tool.isActive) {
    throw new AppError(status.NOT_FOUND, "Tool not found or inactive");
  }
  return tool;
};

const getSingleToolByToolIdFromDB = async (toolId: string) => {
  const tool = await ToolModel.findOne({ toolId }).lean();

  if (!tool || !tool.isActive) {
    throw new AppError(status.NOT_FOUND, "Tool not found or inactive");
  }

  return tool;
};

const updateToolIntoDB = async (id: string, payload: IToolUpdate) => {
  const updateData = {
    name: payload.name,
    logo: payload?.logo,
    description: payload.description,
    price: payload.price,
    commissionRate: payload.commissionRate,
    isActive: payload.isActive,
  };

  const updatedTool = await ToolModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();

  if (!updatedTool || !updatedTool.isActive) {
    throw new AppError(status.NOT_FOUND, "Tool not found or inactive");
  }

  return updatedTool;
};

const deleteToolIntoDB = async (id: string) => {
  const result = await ToolModel.findByIdAndUpdate(
    id,
    { $set: { isActive: false } },
    { new: true }
  ).lean();

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Tool not found");
  }

  return result;
};

export const ToolServices = {
  createToolIntoDB,
  getAllToolsFromDB,
  getSingleToolFromDB,
  updateToolIntoDB,
  deleteToolIntoDB,
  getSingleToolByToolIdFromDB,
};
