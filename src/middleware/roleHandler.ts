import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authProtect.js";
import { ApiError } from "./errorHandler.js";

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(
        new ApiError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
