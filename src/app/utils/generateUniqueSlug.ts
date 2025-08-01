import { Model } from "mongoose";

export const cleanString = (text: string): string => {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
};

export const generateUniqueId = async (
  baseString: string,
  model: Model<any>,
  field: string
): Promise<string> => {
  const baseId = cleanString(baseString);
  let uniqueId = baseId;
  let suffix = 1;

  const query: any = {};
  while (await model.findOne({ [field]: uniqueId })) {
    uniqueId = `${baseId}${suffix++}`;
  }

  return uniqueId;
};

/**
const fullName = `${payload.firstName}${payload.lastName}`;
const userId = await generateUniqueId(fullName, UserModel, "userId");

 */
