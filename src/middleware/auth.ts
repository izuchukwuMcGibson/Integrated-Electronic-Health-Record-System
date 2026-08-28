import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AppError, ApiResponse } from "./errorHandler";
import { AuthRequest, JwtPayload } from "../types/auth";
import { UserRole } from "@prisma/client";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

/**
 * Middleware: Authenticate JWT token
 * Extracts and validates JWT from Authorization header
 */
export const authenticate = (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Missing or invalid Authorization header");
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.userId !== "string" ||
      typeof decoded.email !== "string" ||
      !Object.values(UserRole).includes(decoded.role as UserRole)
    ) {
      throw new AppError(401, "Invalid token payload");
    }

    req.user = decoded as JwtPayload;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }
    return res.status(401).json({
      success: false,
      error: "Authentication failed",
    });
  }
};

/**
 * Middleware: Authorize by role(s)
 * Returns middleware that checks if user has one of the allowed roles
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};


