import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { UserService } from "../services/UserService.js";
import { ApiError } from "../middleware/errorHandler.js";
import { parseQuery, type QueryOptions } from "../utils/queryHelper.js";
import type { AuthRequest } from "../middleware/authProtect.js";

/**
 * @desc Get All Users
 * @route GET /users
 * @access Private
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const options: QueryOptions = parseQuery(req.query);

  const users = await UserService.getAllUsers(options);

  const { data, total, page, limit } = users;

  res.json({
    success: true,
    message: users.data.length
      ? "Users fetched successfully"
      : "No users found",
    pagination: {
      total,
      page,
      limit,
      totalPages: limit ? Math.ceil(total / limit) : 1,
    },
    data,
  });
});

/**
 * @desc Get user by ID
 * @route GET /users/:id
 * @access Private
 */
export const getUserById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    if (!id) throw new ApiError("ID is required", 400);

    if (!req.userId || !req.userRole)
      throw new ApiError("Missing required fields", 400);

    const user = await UserService.getUserById(id, req.userId, req.userRole);
    res.json({
      success: true,
      message: `User ${user.username} found successfully`,
      data: user,
    });
  }
);

/**
 * @desc Update User Profile (self-only)
 * @route PATCH /users/:id
 * @access Private
 */
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.userId; // req.userId from the token
    if (!id) throw new ApiError("ID is required", 400);

    const updated = await UserService.updateProfile(id, req.body);
    res.json({
      success: true,
      message: `User ${updated.username} updated successfully`,
      data: updated,
    });
  }
);

/**
 * @desc Update User role or activity (admin only)
 * @route PATCH /users/:id
 * @access Private
 */
export const adminUpdateUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    if (!id || !req.userId) throw new ApiError("ID is required", 400);

    const adminUpdate = await UserService.adminUpdateUser(
      id,
      req.body,
      req.userId
    );
    res.json({
      success: true,
      message: `User ${adminUpdate.username} status/role updated successfully`,
      data: adminUpdate,
    });
  }
);

/**
 * @desc Delete User
 * @route DELETE /users/:id
 * @access Private
 */
export const deleteUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    if (!id) throw new ApiError("ID is required", 400);

    if (!req.userId || !req.userRole)
      throw new ApiError("Missing required fields", 400);

    const deleted = await UserService.deleteUser(id, req.userId, req.userRole);
    res.json({
      success: true,
      message: `User ${deleted.username} deleted successfully`,
      data: deleted,
    });
  }
);
