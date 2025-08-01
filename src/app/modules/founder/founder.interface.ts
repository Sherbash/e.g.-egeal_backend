import { Types } from "mongoose";

export interface IFounder {
    userId: Types.ObjectId;
    tools: string[];
    additionalNotes?: string;
    createdAt: string;
    updatedAt: string;
}
