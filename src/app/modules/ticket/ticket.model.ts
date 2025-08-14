import { Schema, model, Types } from "mongoose";
import { ITicket, TicketStatus } from "./ticket.interface";

interface ITicketDocument extends ITicket, Document {}

const ticketSchema = new Schema<ITicketDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    ticketType: {
      type: String,
      enum: ["REQUEST", "ISSUE", "SUPPORT"],
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.OPEN,
    },
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    replies: [
      {
        sender: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export const TicketModel = model<ITicketDocument>("Ticket", ticketSchema);