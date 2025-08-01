import { Schema, model } from "mongoose";
import { IChat, TMessage } from "./chat.interface";


const messageSchema = new Schema<TMessage>({
  messageText: { type: String, required: true },
  sender: { type: String, enum: ["influencer", "founder"], required: true },
  timeStamp: { type: String, required: true },
});

const chatSchema = new Schema<IChat>(
  {
    influencerId: { type: Schema.Types.ObjectId, ref: "Influencer", required: true },
    founderId: { type: Schema.Types.ObjectId, ref: "Founder", required: true },
    conversation: [messageSchema],
    promotions: [{ type: Schema.Types.ObjectId, ref: "Promotion" }],
  },
  { timestamps: true }
);

export const Chat = model<IChat>("Chat", chatSchema);