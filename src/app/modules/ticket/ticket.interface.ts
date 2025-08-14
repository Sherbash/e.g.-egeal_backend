import { Types } from "mongoose";

export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export interface ITicket {
  name: string;
  email: string;
  message: string;
  ticketType: "REQUEST" | "ISSUE" | "SUPPORT";
  sender?: Types.ObjectId;
  recipient?: Types.ObjectId;
  status: TicketStatus;
  ticketNumber: string;
  replies: { sender: Types.ObjectId; message: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITicketPayload {
  name: string;
  email: string;
  message: string;
  ticketType: "REQUEST" | "ISSUE" | "SUPPORT";
  senderId?: string;
  recipientId?: string;
}

export interface ITicketReplyPayload {
  ticketId: string;
  senderId: string;
  message: string;
}

export interface ITicketTrackPayload {
  ticketNumber: string;
}

export interface ITicketStatusUpdate {
  status: TicketStatus;
}