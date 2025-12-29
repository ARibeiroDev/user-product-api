import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { UserService } from "../services/UserService.js";
import { ApiError } from "../middleware/errorHandler.js";

/**
 * @desc Create/Register new user
 * @route POST /auth/register
 * @access Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await UserService.register(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

/**
 * @desc Resend verification email
 * @route POST /auth/resend-verification
 * @access Public
 */
export const resendVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) throw new ApiError("Email is required", 400);

    await UserService.resendVerificationEmail(email);

    res.json({
      success: true,
      message:
        "Verification email sent if the account exists and is unverified",
    });
  }
);

/**
 * @desc Verify email once registered
 * @route GET /auth/verify-email
 * @access Public
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token || typeof token !== "string")
    throw new ApiError("Token is required", 400);

  const message = await UserService.verifyEmail(token);
  res.json({
    success: true,
    message,
  });
});

/**
 * @desc Login user
 * @route POST /auth/login
 * @access Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password)
    throw new ApiError("Missing required fields", 400);

  const { user, accessTkn, refreshTkn } = await UserService.login(
    identifier,
    password
  );

  res.cookie("jwt", refreshTkn, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: "Logged in",
    data: {
      user,
      accessTkn: accessTkn,
    },
  });
});

/**
 * @desc Request password reset email
 * @route POST /auth/forgot-password
 * @access Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) throw new ApiError("Email is required", 400);

    await UserService.forgotPassword(email);

    res.json({
      success: true,
      message: "Password reset email sent if account exists",
    });
  }
);

/**
 * @desc Reset password using token
 * @route POST /auth/reset-password
 * @access Public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      throw new ApiError("Token and new password are required", 400);

    await UserService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  }
);

/**
 * @desc Refresh Access Token
 * @route POST /auth/refresh
 * @access Public (vie cookie)
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) throw new ApiError("Unauthorized", 401);

  const { accessToken } = await UserService.refresh(cookies.jwt);

  res.json({
    success: true,
    accessToken,
  });
});

/**
 * @desc Logout
 * @route POST /auth/logout
 * @access Public
 */

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (cookies?.jwt) {
    await UserService.logout(cookies.jwt);
  }

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.json({
    success: true,
    message: "Logged out",
  });
});
