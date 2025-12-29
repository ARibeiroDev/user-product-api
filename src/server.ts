import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { getDirName } from "./utils/pathHelper.js";
import { router as homeRoutes } from "./routes/homeRoutes.js";
import { router as productRoutes } from "./routes/productRoutes.js";
import { router as userRoutes } from "./routes/userRoutes.js";
import { router as authRoutes } from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { connectDB } from "./config/dbConn.js";
import { setupSwagger } from "./docs/swagger.js";

const __dirname = getDirName(import.meta.url);

export const app = express();
const PORT = process.env.PORT || 3500;

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "..", "public")));

app.use("/", homeRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
setupSwagger(app);

app.use("/{*splat}", (req: Request, res: Response) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("text").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

mongoose.connection.on("error", (err: unknown) => {
  err instanceof Error ? console.error(err.message) : console.error(err);
});
