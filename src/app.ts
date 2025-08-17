import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import router from "./app/routes";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";

const app: Application = express();

// Middleware setup
// app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));
app.use(cors({ origin: ["http://localhost:3000", "https://egealaihub.vercel.app"], credentials: true }));
// app.use(cors({ origin: "*" }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Marshall app running now!");
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
