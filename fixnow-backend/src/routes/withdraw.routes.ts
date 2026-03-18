import express from "express";
import {
  createWithdrawRequestController,
  getProviderWithdrawRequestsController,
  getAllWithdrawRequestsController,
  approveWithdrawRequestController,
  rejectWithdrawRequestController
} from "../controllers/withdraw.controller";

const router = express.Router();

/*
Provider
*/

router.post(
  "/provider/withdraw",
  createWithdrawRequestController
);

router.get(
  "/provider/withdraws",
  getProviderWithdrawRequestsController
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