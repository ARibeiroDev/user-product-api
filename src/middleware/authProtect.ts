import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./errorHandler.js";
import { asyncHandler } from "./asyncHandler.js";
import { User } from "../models/UserModel.js";

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

//Extend Request to include user data
export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}
export const authProtect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      throw new ApiError("Unauthorized: No token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token!,
        process.env.ACCESS_TOKEN_SECRET!
      ) as DecodedToken;

      // Fetch user role once here so all subsequent controllers/middlewares have it
      const user = await User.findById(decoded.userId).select("role isActive");

      if (!user) {
        throw new ApiError("User no longer exists", 404);
      }

      if (!user.isActive) {
        throw new ApiError("Account is disabled", 403);
      }

      req.userId = decoded.userId;
      req.userRole = user.role; // Now we know the role for the whole request cycle

      next();
    } catch (error) {
      throw new ApiError("Forbidden: Invalid or expired token", 403);
    }
  }
);
