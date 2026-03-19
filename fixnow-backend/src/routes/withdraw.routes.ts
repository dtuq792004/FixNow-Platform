import express from "express";
import {
  createWithdrawRequestController,
  getUserWithdrawRequestsController,
  getAllWithdrawRequestsController,
  approveWithdrawRequestController,
  rejectWithdrawRequestController
} from "../controllers/withdraw.controller";

const router = express.Router();

/*
User (Provider/Customer)
*/

router.post(
  "/withdraw",
  createWithdrawRequestController
);

router.get(
  "/withdraws",
  getUserWithdrawRequestsController
);

/*
Backward compatibility or specific prefixes
*/

router.post(
  "/provider/withdraw",
  createWithdrawRequestController
);

router.get(
  "/provider/withdraws",
  getUserWithdrawRequestsController
);

router.post(
  "/customer/withdraw",
  createWithdrawRequestController
);

router.get(
  "/customer/withdraws",
  getUserWithdrawRequestsController
);

/*
Admin
*/

router.get(
  "/admin/withdraws",
  getAllWithdrawRequestsController
);

router.patch(
  "/admin/withdraws/:id/approve",
  approveWithdrawRequestController
);

router.patch(
  "/admin/withdraws/:id/reject",
  rejectWithdrawRequestController
);

export default router;