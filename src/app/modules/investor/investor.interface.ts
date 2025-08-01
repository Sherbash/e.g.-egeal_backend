import { Types } from "mongoose";

export interface IInvestor {
    userId: Types.ObjectId;
    investIn: {
        toolId: Types.ObjectId,
        amount: number,
        note: string
    }[];
    additionalNotes?: string;
    projectPreference: string;
    investmentRange: string;

    createdAt: string;
    updatedAt: string;
}
