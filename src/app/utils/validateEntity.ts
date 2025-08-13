import { Model, Types } from "mongoose";
import status from "http-status";
import { StoryModel } from "../modules/storyPoll/storyPoll.model";
import { ToolModel } from "../modules/tool/tool.model";
import AppError from "../errors/appError";
import { Influencer } from "../modules/influencer/influencer.model";

// Define a type for supported models
type EntityModel = Model<any> & {
  findOne: (id: Types.ObjectId) => Promise<any>;
};

// Strongly type ENTITY_MODELS
const ENTITY_MODELS: Record<string, EntityModel> = {
  story: StoryModel,
  tool: ToolModel,
  influencer: Influencer
};

export const validateEntity = async (
  entityQueryField: string,
  entityId: Types.ObjectId | string,
  entityType: string
) => {
  const model = ENTITY_MODELS[entityType];

  if (!model) {
    throw new AppError(status.BAD_REQUEST, "Invalid entity type");
  }
// console.log("entityId", entityId, entityType, entityQueryField)
  const entityExists = await model.findOne({ [entityQueryField]: entityId });
  if (!entityExists) {
    throw new AppError(status.NOT_FOUND, `${entityType} not found`);
  }

  return true;
};
