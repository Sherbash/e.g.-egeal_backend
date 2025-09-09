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
import { sendEmail } from "../../utils/emailHelper";
import { Campaign } from "../campaign/campaign.model";

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

    if(createdTool.length){
      await sendEmail(
  user.email,
  "🛠️ Tool Created Successfully",
  `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      <div style="max-width: 600px; background-color: #ffffff; margin: auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background-color: #2196F3; color: white; padding: 15px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">🛠️ Tool Created Successfully</h1>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 16px; color: #333;">
            Hello <strong>${user.firstName || "User"}</strong>,
          </p>
          <p style="font-size: 15px; color: #555;">
            Your new tool has been successfully created in our system!  
            You can now access and manage it from your dashboard.
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard/add-tools" style="background-color: #2196F3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Your Tools
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

    }


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

  const query: any = {};

  // 🔎 Search filter
  if (filters.searchTerm) {
    query.$or = [
      { name: { $regex: filters.searchTerm, $options: "i" } },
      { description: { $regex: filters.searchTerm, $options: "i" } },
      { toolId: { $regex: filters.searchTerm, $options: "i" } },
    ];
  }

  // ✅ Boolean filters (must check !== undefined)
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  if (filters.launched !== undefined) {
    query.launched = filters.launched;
  }

  // ✅ Safe sorting defaults
  const sortField = sortBy || "createdAt";   // default field
  const sortDirection = sortOrder === "asc" ? 1 : -1; // default "desc"

  // Run query + count in parallel
  const [tools, total] = await Promise.all([
    ToolModel.find(query)
      .lean()
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit),
    ToolModel.countDocuments(query),
  ]);

  return {
    meta: { page, limit, total },
    data: tools,
  };
};


const getAllToolsByFounderId = async (
  founderId: string,
  paginationOptions: IPaginationOptions,
  filters: { searchTerm?: string; isActive?: boolean; launched?: boolean }
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  const query: any = { founderId };

  // Search filter
  if (filters.searchTerm) {
    query.$or = [
      { name: { $regex: filters.searchTerm, $options: "i" } },
      { description: { $regex: filters.searchTerm, $options: "i" } },
      { toolId: { $regex: filters.searchTerm, $options: "i" } },
    ];
  }

  // isActive filter
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  // launched filter
  if (filters.launched !== undefined) {
    query.launched = filters.launched;
  }

  const tools = await ToolModel.find(query)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean();

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


// const getAllToolsByFounderUserId = async (
//   userId: string,
//   paginationOptions: IPaginationOptions,
//   filters: { searchTerm?: string; isActive?: boolean; launched?: boolean }
// ) => {
//   const founder = await Founder.findOne({ userId });
//   if (!founder) {
//     throw new AppError(status.NOT_FOUND, "Founder not found for this userId");
//   }

//   const { limit, page, skip, sortBy, sortOrder } =
//     paginationHelper.calculatePagination(paginationOptions);

//   const query: any = { founderId: founder._id };

//   // Search filter
//   if (filters.searchTerm) {
//     query.$or = [
//       { name: { $regex: filters.searchTerm, $options: "i" } },
//       { description: { $regex: filters.searchTerm, $options: "i" } },
//       { toolId: { $regex: filters.searchTerm, $options: "i" } },
//     ];
//   }

//   if (filters.isActive !== undefined) {
//     query.isActive = filters.isActive;
//   }

//   if (filters.launched !== undefined) {
//     query.launched = filters.launched;
//   }

//   const tools = await ToolModel.find(query)
//     .sort({ [sortBy]: sortOrder })
//     .skip(skip)
//     .limit(limit)
//     .lean();

//   const total = await ToolModel.countDocuments(query);

//   return {
//     meta: { page, limit, total },
//     data: tools,
//   };
// };
const getAllToolsByFounderUserId = async (
  userId: string,
  paginationOptions: IPaginationOptions,
  filters: { searchTerm?: string; isActive?: boolean; launched?: boolean }
) => {
  // 1. Founder check
  const founder = await Founder.findOne({ userId });
  if (!founder) {
    throw new AppError(status.NOT_FOUND, "Founder not found for this userId");
  }

  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  // 2. Tool query (founder specific)
  const query: any = { founderId: founder._id };

  if (filters.searchTerm) {
    query.$or = [
      { name: { $regex: filters.searchTerm, $options: "i" } },
      { description: { $regex: filters.searchTerm, $options: "i" } },
      { toolId: { $regex: filters.searchTerm, $options: "i" } },
    ];
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  if (filters.launched !== undefined) {
    query.launched = filters.launched;
  }

  // 3. Fetch tools
  const tools = await ToolModel.find(query)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean();

  const toolIds = tools.map((tool) => tool.toolId);

  // 4. Check campaigns for these tools
  const campaigns = await Campaign.find({ toolId: { $in: toolIds } })
    .select("toolId")
    .lean();

  const campaignToolIds = new Set(campaigns.map((c) => c.toolId));

  // 5. Add campaign flag to each tool
  const toolsWithCampaignFlag = tools.map((tool) => ({
    ...tool,
    campaign: campaignToolIds.has(tool.toolId), // true/false
  }));

  const total = await ToolModel.countDocuments(query);

  return {
    meta: { page, limit, total },
    data: toolsWithCampaignFlag,
  };
};


export const ToolServices = {
  createToolIntoDB,
  getAllToolsFromDB,
  getSingleToolFromDB,
  getAllToolsByFounderId,
  updateToolIntoDB,
  deleteToolIntoDB,
  getSingleToolByToolIdFromDB,
  getAllToolsByFounderUserId,
};
