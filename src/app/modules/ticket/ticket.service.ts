import mongoose, { Types } from "mongoose";
import httpStatus from "http-status"; // Renamed import to avoid conflict
import { ITicketPayload, ITicketReplyPayload, TicketStatus } from "./ticket.interface";
import AppError from "../../errors/appError";
import { TicketModel } from "./ticket.model";
import UserModel from "../user/user.model";
import { Founder } from "../founder/founder.model";
import { Influencer } from "../influencer/influencer.model";
import config from "../../config";
import { sendEmail } from "../../utils/emailHelper";


const createTicketIntoDB = async (payload: ITicketPayload) => {
  const { name, email, message, ticketType, senderId, recipientId } = payload;

  // Validate required fields
  if (!name || !email || !message || !ticketType) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Name, email, message, and ticket type are required"
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid email format");
  }

  // Generate unique ticket number
  const ticketNumber = `TICKET-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const ticketData = {
    name,
    email,
    message,
    ticketType,
    sender: senderId ? new Types.ObjectId(senderId) : null,
    recipient: recipientId ? new Types.ObjectId(recipientId) : null,
    status: TicketStatus.OPEN, // Fixed: Changed TicketStatusOPEN to TicketStatus.OPEN
    ticketNumber,
    replies: [],
  };

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticket = await TicketModel.create([ticketData], { session });

    // Prepare email content
    const sender = senderId ? await UserModel.findById(senderId).session(session) : null;
    const recipient = recipientId ? await UserModel.findById(recipientId).session(session) : null;
    const founder = senderId
      ? await Founder.findOne({ userId: new Types.ObjectId(senderId) })
          .populate("userId")
          .session(session)
      : null;
    const influencer = recipientId
      ? await Influencer.findOne({ userId: new Types.ObjectId(recipientId) })
          .populate("userId")
          .session(session)
      : null;

    const emailSubject = `New Ticket #${ticket[0].ticketNumber}: ${ticketType}`;
    const emailMessage = `
      <h2>New ${ticketType} Ticket</h2>
      <p><strong>Ticket Number:</strong> ${ticket[0].ticketNumber}</p>
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Status:</strong> ${ticket[0].status}</p>
      <p>Track this ticket: ${config.client_url}/track-ticket/${ticket[0].ticketNumber}</p>
      ${sender ? `<p>View details in your dashboard: ${config.client_url}/dashboard/tickets/${ticket[0]._id}</p>` : ""}
    `;

    // Send email to submitter
    await sendEmail(
      email,
      emailSubject,
      `<p>Hi ${name},</p><p>Your ticket has been submitted successfully.</p>${emailMessage}`
    );

    // Send email to recipient if exists
    if (recipient?.email) {
      await sendEmail(
        recipient.email,
        emailSubject,
        `<p>Hi ${recipient.firstName},</p>${emailMessage}`
      );
    }

    // Send to influencer if recipient is an influencer
    if (influencer?.userId && (influencer.userId as any).email) {
      await sendEmail(
        (influencer.userId as any).email,
        emailSubject,
        `<p>New ticket assigned to you!</p>${emailMessage}`
      );
    }

    // Send to founder if recipient is a founder
    if (founder?.userId && (founder.userId as any).email && recipientId) {
      await sendEmail(
        (founder.userId as any).email,
        emailSubject,
        `<p>New ticket for you!</p>${emailMessage}`
      );
    }

    // Send email to admin
    await sendEmail(
      config.admin_email || "smhasanjamil14@gmail.com",
      emailSubject,
      `<p>Admin notice: A new ticket has been created.</p>${emailMessage}`
    );

    await session.commitTransaction();
    return ticket[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const replyToTicketIntoDB = async (payload: ITicketReplyPayload) => {
  const { ticketId, senderId, message } = payload;

  if (!ticketId || !senderId || !message) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Ticket ID, sender ID, and message are required"
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticket = await TicketModel.findById(ticketId).session(session);
    if (!ticket) {
      throw new AppError(httpStatus.NOT_FOUND, "Ticket not found");
    }

    const sender = await UserModel.findById(senderId).session(session);
    if (!sender) {
      throw new AppError(httpStatus.NOT_FOUND, "Sender not found");
    }

    const reply = {
      sender: new Types.ObjectId(senderId),
      message,
      createdAt: new Date(),
    };

    ticket.replies.push(reply);
    ticket.status = TicketStatus.IN_PROGRESS;
    await ticket.save({ session });

    // Prepare email content
    const recipient = ticket.recipient
      ? await UserModel.findById(ticket.recipient).session(session)
      : null;

    const emailSubject = `Reply to Ticket #${ticket.ticketNumber}: ${ticket.ticketType}`;
    const emailMessage = `
      <h2>Ticket Reply</h2>
      <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
      <p><strong>From:</strong> ${sender.firstName} ${sender.lastName}</p>
      <p><strong>Reply:</strong> ${message}</p>
      <p><strong>Status:</strong> ${ticket.status}</p>
      <p>View conversation: ${config.client_url}/track-ticket/${ticket.ticketNumber}</p>
      <p>View in dashboard: ${config.client_url}/dashboard/tickets/${ticket._id}</p>
    `;

    // Notify sender
    if (sender.email) {
      await sendEmail(
        sender.email,
        emailSubject,
        `<p>Hi ${sender.firstName},</p><p>Your reply has been added to the ticket.</p>${emailMessage}`
      );
    }

    // Notify recipient
    if (recipient?.email) {
      await sendEmail(
        recipient.email,
        emailSubject,
        `<p>Hi ${recipient.firstName},</p><p>A new reply has been added to your ticket.</p>${emailMessage}`
      );
    }

    // Notify original ticket submitter
    if (ticket.email) {
      await sendEmail(
        ticket.email,
        emailSubject,
        `<p>Hi ${ticket.name},</p><p>A new reply has been added to your ticket.</p>${emailMessage}`
      );
    }

    // Notify admin
    await sendEmail(
      config.admin_email || "smhasanjamil14@gmail.com",
      emailSubject,
      `<p>Admin notice: New reply added to ticket.</p>${emailMessage}`
    );

    await session.commitTransaction();
    return ticket;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const trackTicketFromDB = async (ticketNumber: string) => {
  if (!ticketNumber) {
    throw new AppError(httpStatus.BAD_REQUEST, "Ticket number is required");
  }

  const ticket = await TicketModel.findOne({ ticketNumber })
    .populate("sender recipient replies.sender")
    .lean();

  if (!ticket) {
    throw new AppError(httpStatus.NOT_FOUND, "Ticket not found");
  }

  return {
    ticketNumber: ticket.ticketNumber,
    name: ticket.name,
    email: ticket.email,
    message: ticket.message,
    ticketType: ticket.ticketType,
    status: ticket.status,
    replies: ticket.replies,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
};

const getTicketsByUserIdFromDB = async (userId: string) => {
  const tickets = await TicketModel.find({
    $or: [
      { sender: new Types.ObjectId(userId) },
      { recipient: new Types.ObjectId(userId) },
    ],
  })
    .sort({ createdAt: -1 })
    .populate("sender recipient replies.sender")
    .lean();

  return tickets;
};

const getAllTicketsFromDB = async () => {
  const tickets = await TicketModel.find({})
    .sort({ createdAt: -1 })
    .populate("sender recipient replies.sender")
    .lean();

  return tickets;
};

const updateTicketStatusIntoDB = async (ticketId: string, status: TicketStatus) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticket = await TicketModel.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true, runValidators: true }
    )
      .populate("sender recipient replies.sender")
      .session(session)
      .lean();

    if (!ticket) {
      throw new AppError(httpStatus.NOT_FOUND, "Ticket not found");
    }

    // Notify relevant parties
    const sender = ticket.sender ? await UserModel.findById(ticket.sender).session(session) : null;
    const recipient = ticket.recipient
      ? await UserModel.findById(ticket.recipient).session(session)
      : null;

    const emailSubject = `Ticket #${ticket.ticketNumber} Status Update`;
    const emailMessage = `
      <h2>Ticket Status Updated</h2>
      <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
      <p><strong>From:</strong> ${ticket.name}</p>
      <p><strong>Message:</strong> ${ticket.message}</p>
      <p><strong>New Status:</strong> ${status}</p>
      <p>Track this ticket: ${config.client_url}/track-ticket/${ticket.ticketNumber}</p>
      ${sender ? `<p>View in dashboard: ${config.client_url}/dashboard/tickets/${ticket._id}</p>` : ""}
    `;

    // Notify original ticket submitter
    if (ticket.email) {
      await sendEmail(
        ticket.email,
        emailSubject,
        `<p>Hi ${ticket.name},</p><p>Your ticket status has been updated.</p>${emailMessage}`
      );
    }

    // Notify sender (if registered user)
    if (sender?.email) {
      await sendEmail(
        sender.email,
        emailSubject,
        `<p>Hi ${sender.firstName},</p><p>Your ticket status has been updated.</p>${emailMessage}`
      );
    }

    // Notify recipient
    if (recipient?.email) {
      await sendEmail(
        recipient.email,
        emailSubject,
        `<p>Hi ${recipient.firstName},</p><p>A ticket assigned to you has been updated.</p>${emailMessage}`
      );
    }

    // Notify admin
    await sendEmail(
      config.admin_email || "smhasanjamil14@gmail.com",
      emailSubject,
      `<p>Admin notice: Ticket status updated.</p>${emailMessage}`
    );

    await session.commitTransaction();
    return ticket;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const TicketServices = {
  createTicketIntoDB,
  replyToTicketIntoDB,
  trackTicketFromDB,
  getTicketsByUserIdFromDB,
  getAllTicketsFromDB,
  updateTicketStatusIntoDB,
};