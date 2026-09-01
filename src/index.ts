import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import {
  errorHandler,
  ApiResponse,
  asyncHandler,
} from "./middleware/errorHandler";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import patientRoutes from "./routes/patient";
import aiReviewRoutes from "./routes/aiReview";
import cors from "cors";
import morgan from "morgan";

const NODE_ENV = process.env.NODE_ENV ?? "development";
const PORT = Number(process.env.PORT ?? 3000);

const app = express();
const prisma = new PrismaClient();
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // Example local frontend (Vite),
  "https://ihrs-frontend-chi.vercel.app",
  process.env.FRONTEND_URL || "", // Add your production URL to your .env
].filter(Boolean);

// Middleware
app.use(express.json());
app.use(morgan("combined"));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Health check route
app.get(
  "/health",
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    res.json({
      success: true,
      data: { status: "Server is running" },
    });
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/ai-review", aiReviewRoutes);

// 404 handler
app.use((req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${NODE_ENV}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n✓ Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
