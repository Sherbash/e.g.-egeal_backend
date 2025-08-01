import { Types } from "mongoose";

export interface ICourse {
    authorId: Types.ObjectId;
    courseName: string,
    courseDescription: string,
    courseTopics: string[],
    courseContents: string[]
}
