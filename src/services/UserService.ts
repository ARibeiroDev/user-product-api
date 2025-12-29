import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/UserModel.js";
import { ApiError } from "../middleware/errorHandler.js";
import { signAccessToken, signRefreshToken } from "../utils/token.js";
import type { IUser } from "../types/IUser.js";
import { Types } from "mongoose";
import type { PaginationOptions } from "./ProductService.js";
import { EmailService } from "./EmailService.js";

export class UserService {
  // User register/Create User
  static async register(input: Partial<IUser>) {
    const { email, username, password } = input;
    if (!email || !username || !password)
      throw new ApiError("Required fields missing", 400);

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) throw new ApiError("User already exists", 409);

    const hashedPwd = await bcrypt.hash(password, 10);
    const rawToken = crypto.randomBytes(32).toString("hex");
    const verificationToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const newUser = await User.create({
      ...input,
      password: hashedPwd,
      isVerified: false,
      isActive: true,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await EmailService.sendVerificationEmail(email, rawToken);

    return { username: newUser.username, email: newUser.email };
  }

  // Resend verification email
  static async resendVerificationEmail(email: string) {
    const user = await User.findOne({ email });

    if (!user) return;
    if (user.isVerified) return; // Already verified

    const rawToken = crypto.randomBytes(32).toString("hex");
    const verificationToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save();
    await EmailService.sendVerificationEmail(email, rawToken);
  }

  // Verify Email
  static async verifyEmail(token: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) throw new ApiError("Invalid or expired token", 400);

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();
    return "Email verified successfully";
  }

  // User Login
  static async login(identifier: string, password: string) {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password +refreshToken");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new ApiError("Invalid credentials", 401);
    }

    if (!user.isVerified) throw new ApiError("Please verify your email", 403);
    if (!user.isActive) throw new ApiError("Account is disabled", 403);

    const accessTkn = signAccessToken(user._id as string);
    const refreshTkn = signRefreshToken(user._id as string);

    user.refreshToken = refreshTkn;
    await user.save();

    const safeUser = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    return { user: safeUser, accessTkn, refreshTkn };
  }

  // Request password reset
  static async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) return; // Not revealing non-existing emails

    const rawToken = crypto.randomBytes(32).toString("hex");
    const resetToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.save();
    await EmailService.sendPasswordResetEmail(email, rawToken);
  }

  // Reset password
  static async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) throw new ApiError("Invalid or expired token", 400);

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
  }

  // Refresh token
  static async refresh(cookieRefreshToken: string) {
    if (!cookieRefreshToken) throw new ApiError("Unauthorized", 401);

    let decoded: any;
    try {
      decoded = jwt.verify(
        cookieRefreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      );
    } catch (error) {
      throw new ApiError("Forbidden: Expired or Invalid Refresh Token", 403);
    }

    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user || !user.isActive) throw new ApiError("Unauthorized", 401);

    // Token Reuse Detection
    if (user.refreshToken !== cookieRefreshToken) {
      throw new ApiError("Forbidden: Invalid Token", 403);
    }

    // Issue new access token
    const newAccessToken = signAccessToken(user._id as string);

    return { accessToken: newAccessToken };
  }

  // Logout
  static async logout(cookieRefreshToken: string) {
    if (!cookieRefreshToken) return; // Already logged out

    const user = await User.findOne({ refreshToken: cookieRefreshToken });

    if (!user) return;

    user.refreshToken = undefined;
    await user.save();
  }

  // Get All Users (Admin only)
  static async getAllUsers(options: PaginationOptions) {
    const { page = 1, limit = 10, sort = "newest" } = options;

    const sortOpt: any =
      sort === "asc"
        ? { username: 1 }
        : sort === "desc"
        ? { username: -1 }
        : { createdAt: -1 };

    const [total, data] = await Promise.all([
      User.countDocuments(),
      User.find()
        .select("-email")
        .sort(sortOpt)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<IUser[]>(),
    ]);

    return { data, total, page, limit };
  }

  // Get User By ID
  static async getUserById(
    id: string,
    requesterId: string,
    requesterRole: string
  ): Promise<IUser> {
    if (!Types.ObjectId.isValid(id)) throw new ApiError("Invalid user ID", 400);

    const user = await User.findById(id)
      .select("username role isActive createdAt")
      .lean<IUser>();
    if (!user) throw new ApiError("User not found", 404);

    const isAdmin = requesterRole === "admin";
    const isSelf = requesterId === id;
    if (!isAdmin && !isSelf) {
      throw new ApiError("You do not have permission to view this user", 403);
    }

    return user;
  }

  // Update User Profile (User only)
  static async updateProfile(
    id: string,
    input: Partial<IUser>
  ): Promise<IUser> {
    if (!Types.ObjectId.isValid(id)) throw new ApiError("Invalid user ID", 400);

    const user = await User.findById(id);
    if (!user) throw new ApiError("User not found", 404);

    if ("email" in input) {
      throw new ApiError("Email cannot be changed", 400);
    }
    if ("role" in input || "isActive" in input) {
      throw new ApiError("Forbidden", 403);
    }

    if (input.username) {
      const exists = await User.findOne({
        username: input.username,
        _id: { $ne: id },
      });
      if (exists) throw new ApiError("Username already taken", 409);
      user.username = input.username;
    }

    if (input.password) {
      user.password = await bcrypt.hash(input.password, 10);
    }

    await user.save();
    return user.toObject();
  }

  // Grant User role or ban (Admin only)
  static async adminUpdateUser(
    targetUserId: string,
    input: Partial<IUser>,
    adminId: string
  ) {
    const allowedFields = ["role", "isActive"];

    for (const key of Object.keys(input)) {
      if (!allowedFields.includes(key)) {
        throw new ApiError(`Field '${key}' cannot be updated by admin`, 400);
      }
    }

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      throw new ApiError("Admin privileges required", 403);
    }

    if (targetUserId === adminId && input.role === "user") {
      throw new ApiError("Admin cannot demote themselves", 400);
    }

    const updatedUser = await User.findByIdAndUpdate(targetUserId, input, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new ApiError("User not found", 404);
    }

    return updatedUser;
  }

  // Delete User (Admin only)
  static async deleteUser(
    id: string,
    requesterId: string,
    requesterRole: string
  ): Promise<IUser> {
    if (!Types.ObjectId.isValid(id)) throw new ApiError("Invalid user ID", 400);

    const isOwner = requesterId === id;
    const isAdmin = requesterRole === "admin";

    if (!isOwner && !isAdmin) {
      throw new ApiError(
        "You do not have permission to delete this account",
        403
      );
    }

    const deleted = await User.findByIdAndDelete(id)
      .select("username role isActive createdAt")
      .lean<IUser>();

    if (!deleted) throw new ApiError("User not found", 404);

    return deleted;
  }
}
