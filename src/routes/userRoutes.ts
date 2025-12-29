import Router from "express";
import {
  getAllUsers,
  getUserById,
  updateProfile,
  adminUpdateUser,
  deleteUser,
} from "../controllers/userController.js";
import { authProtect } from "../middleware/authProtect.js";
import { restrictTo } from "../middleware/roleHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { updateUserValidation } from "../validations/userValidation.js";

export const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile operations
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of users with pagination
 *       403:
 *         description: Forbidden
 */
router.get("/", authProtect, restrictTo("admin"), getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Admins can fetch any user. Users can fetch only their own profile.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data returned successfully
 *       404:
 *         description: User not found
 */
router.get("/:id", authProtect, getUserById);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update own profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       422:
 *         description: Validation error
 */
router.patch(
  "/me",
  authProtect,
  updateUserValidation,
  validateRequest,
  updateProfile
);

/**
 * @swagger
 * /users/{id}/admin:
 *   patch:
 *     summary: Update user role or status (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 example: "user"
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User role/status updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch("/:id/admin", authProtect, restrictTo("admin"), adminUpdateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user (admin or self)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.delete("/:id", authProtect, deleteUser);
