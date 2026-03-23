import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser
} from "../controllers/adminUser.controller";

// import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * ADMIN routes
 */

router.get(
  "/users",
  // authMiddleware,
  getUsers
);

router.get(
  "/users/:id",
  // authMiddleware,
  getUserById
);

router.patch(
  "/users/:id/status",
  // authMiddleware,
  updateUserStatus
);

router.delete(
  "/users/:id",
  // authMiddleware,
  deleteUser
);

export default router;