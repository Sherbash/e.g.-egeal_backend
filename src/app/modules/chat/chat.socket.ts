import { Server, Socket } from "socket.io";
import { ChatServices } from "./chat.service";
import { TMessage } from "./chat.interface";

export const setupChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("Socket.IO - Client connected:", socket.id);

    // Join a chat room based on chatId
    socket.on("joinChat", (chatId: string) => {
      if (typeof chatId === "string" && chatId.match(/^[0-9a-fA-F]{24}$/)) {
        socket.join(chatId);
        console.log(`Socket.IO - Client ${socket.id} joined chat room ${chatId}`);
        socket.emit("chat:joined", { chatId, message: `Joined chat room ${chatId}` });
      } else {
        socket.emit("chat:error", { message: "Invalid chatId format" });
      }
    });

    // Handle incoming chat messages
    socket.on("chatMessage", async (data: unknown) => {
      console.log("chat.socket - Received chatMessage event with data:", data);

      try {
        // Basic checks for required fields
        if (!data || typeof data !== "object") {
          throw new Error("Invalid message data: Data must be an object");
        }
        const { chatId, messageText, sender, timeStamp } = data as any;
        if (!chatId || typeof chatId !== "string") {
          throw new Error("Invalid chatId: Must be a string");
        }
        if (!messageText || typeof messageText !== "string") {
          throw new Error("Invalid messageText: Must be a non-empty string");
        }
        if (!sender || (sender !== "influencer" && sender !== "founder")) {
          throw new Error("Invalid sender: Must be 'influencer' or 'founder'");
        }
        if (!timeStamp || typeof timeStamp !== "string") {
          throw new Error("Invalid timeStamp: Must be a string");
        }

        console.log("chat.socket - Processed message:", { chatId, messageText, sender, timeStamp });

        // Store message in database
        const updatedChat = await ChatServices.addMessageIntoDB(chatId, {
          messageText,
          sender,
          timeStamp,
        });
        console.log("chat.socket - Message stored in DB:", updatedChat);

        // Emit message to the chat room
        const newMessage: TMessage = { messageText, sender, timeStamp };
        io.to(chatId).emit("chatMessage", newMessage);
        console.log(`chat.socket - Emitted chatMessage to room ${chatId}:`, newMessage);
      } catch (error) {
        console.error("chat.socket - Error processing chatMessage event:", error);
        socket.emit("chat:error", {
          message: "Failed to process message",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket.IO - Client disconnected:", socket.id);
    });
  });
};