import { Request, Response } from "express";
import httpStatus from "http-status"; // Renamed import to avoid conflict
import catchAsync from "../../utils/catchAsync";
import { ticketValidation } from "./ticket.validation";
import sendResponse from "../../utils/sendResponse";
import { TicketServices } from "./ticket.service";
import AppError from "../../errors/appError";


const createTicket = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await TicketServices.createTicketIntoDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ticket created successfully",
    data: result,
  });
});

const replyToTicket = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await TicketServices.replyToTicketIntoDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reply added successfully",
    data: result,
  });
});

const trackTicket = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await TicketServices.trackTicketFromDB(payload.ticketNumber);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ticket fetched successfully",
    data: result,
  });
});

const getTicketsByUserId = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError(httpStatus.BAD_REQUEST, "User ID is required");
  }

  const result = await TicketServices.getTicketsByUserIdFromDB(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tickets fetched successfully",
    data: result,
  });
});

const getAllTickets = catchAsync(async (req: Request, res: Response) => {
  const result = await TicketServices.getAllTicketsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tickets fetched successfully",
    data: result,
  });
});

const updateTicketStatus = catchAsync(async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const { status } = req.body;

  if (!ticketId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Ticket ID is required");
  }

  const result = await TicketServices.updateTicketStatusIntoDB(ticketId, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ticket status updated successfully",
    data: result,
  });
});

export const TicketControllers = {
  createTicket,
  replyToTicket,
  trackTicket,
  getTicketsByUserId,
  getAllTickets,
  updateTicketStatus,
};