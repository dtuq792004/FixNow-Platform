import express from "express";
import {
  createWithdrawRequestController,
  getUserWithdrawRequestsController,
  getAllWithdrawRequestsController,
  approveWithdrawRequestController,
  rejectWithdrawRequestController
} from "../controllers/withdraw.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = express.Router();

/*
User (Provider/Customer) — require auth so req.user is populated
*/

router.post(
  "/withdraw",
  authMiddleware,
  createWithdrawRequestController
);

router.get(
  "/withdraws",
  authMiddleware,
  getUserWithdrawRequestsController
);

/*
Backward compatibility or specific prefixes
*/

router.post(
  "/provider/withdraw",
  authMiddleware,
  roleMiddleware("PROVIDER"),
  createWithdrawRequestController
);

router.get(
  "/provider/withdraws",
  authMiddleware,
  roleMiddleware("PROVIDER"),
  getUserWithdrawRequestsController
);

router.post(
  "/customer/withdraw",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  createWithdrawRequestController
);

router.get(
  "/customer/withdraws",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  getUserWithdrawRequestsController
);

/*
Admin
*/

router.get(
  "/admin/withdraws",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAllWithdrawRequestsController
);

router.patch(
  "/admin/withdraws/:id/approve",
  authMiddleware,
  roleMiddleware("ADMIN"),
  approveWithdrawRequestController
);

router.patch(
  "/admin/withdraws/:id/reject",
  authMiddleware,
  roleMiddleware("ADMIN"),
  rejectWithdrawRequestController
);

export default router;