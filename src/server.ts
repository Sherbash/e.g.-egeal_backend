import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";
import { setupChatSocket } from "./app/modules/chat/chat.socket";

let server: HttpServer | null = null;
let io: SocketIOServer | null = null;

// Database connection
async function connectToDatabase() {
  try {
    await mongoose.connect(config.db_url as string);
    console.log("🛢 Database connected successfully");
  } catch (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  }
}

// Graceful shutdown
function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Closing server...`);
  if (io) {
    io.close(() => {
      console.log("Socket.IO server closed");
    });
  }
  if (server) {
    server.close(() => {
      console.log("HTTP server closed gracefully");
      mongoose.connection.close()
        .then(() => {
          console.log("MongoDB connection closed");
          process.exit(0);
        })
        .catch((err) => {
          console.error("Error closing MongoDB connection:", err);
          process.exit(1);
        });
    });
  } else {
    mongoose.connection.close()
      .then(() => {
        console.log("MongoDB connection closed");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      });
  }
}

// Application bootstrap
async function bootstrap() {
  try {
    await connectToDatabase();
    //await seed();

    // Create HTTP server
    server = new HttpServer(app);

    // Initialize Socket.IO
    io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"], // দুইটা allowed origins
    methods: ["GET", "POST"],
    credentials: true,  // optional, যদি credentials দরকার হয়
  },
});

    // Log global connection/disconnection
    io.on("connection", (socket) => {
      console.log(`🔗 Socket connected: ${socket.id}`);
      socket.on("disconnect", (reason) => {
        console.log(`❌ Socket disconnected: ${socket.id} | Reason: ${reason}`);
      });
    });

    // Setup Socket.IO chat handlers
    setupChatSocket(io);

    // Start server
    server.listen(config.port, () => {
      console.log(`🚀 Eagle server & Socket.IO listening on port ${config.port}`);
    });

    // Listen for termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Error handling
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (error) => {
      console.error("Unhandled Rejection:", error);
      gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    console.error("Error during bootstrap:", error);
    process.exit(1);
  }
}

// Start the application
bootstrap();