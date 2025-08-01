import { Types } from "mongoose";

export interface IInfluencer {
    userId: Types.ObjectId;
    influencerId: string;
    affiliations: string[];
    additionalNotes?: string;
    createdAt: string;
    updatedAt: string;
}
