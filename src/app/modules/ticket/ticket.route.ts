import { Router } from "express";
import { TicketControllers } from "./ticket.controller";

const router = Router();

// Ticket routes
router.post("/create", TicketControllers.createTicket);
router.post("/reply", TicketControllers.replyToTicket);
router.post("/track", TicketControllers.trackTicket);
router.get("/user/:userId", TicketControllers.getTicketsByUserId);
router.get("/admin", TicketControllers.getAllTickets);
router.patch("/:ticketId/status", TicketControllers.updateTicketStatus);

export const TicketRoutes = router;
