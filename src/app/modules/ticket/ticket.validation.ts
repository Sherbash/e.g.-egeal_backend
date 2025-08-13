import z from "zod";

const createTicketZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    message: z.string().min(1, "Message is required"),
    ticketType: z.enum(["REQUEST", "ISSUE", "SUPPORT"], {
      errorMap: () => ({ message: "Ticket type must be REQUEST, ISSUE, or SUPPORT" }),
    }),
    senderId: z.string().optional(),
    recipientId: z.string().optional(),
  }).strict(),
});

const replyToTicketZodSchema = z.object({
  body: z.object({
    ticketId: z.string().min(1, "Ticket ID is required"),
    senderId: z.string().min(1, "Sender ID is required"),
    message: z.string().min(1, "Message is required"),
  }).strict(),
});

const trackTicketZodSchema = z.object({
  body: z.object({
    ticketNumber: z.string().min(1, "Ticket number is required"),
  }).strict(),
});

const updateTicketStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"], {
      errorMap: () => ({ message: "Status must be OPEN, IN_PROGRESS, RESOLVED, or CLOSED" }),
    }),
  }).strict(),
});

export const ticketValidation = {
  createTicketZodSchema,
  replyToTicketZodSchema,
  trackTicketZodSchema,
  updateTicketStatusZodSchema,
};