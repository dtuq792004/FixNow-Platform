import { Router } from "express";
import express from "express";
import { PaymentController } from "../controllers/payment.controller";

const router = Router();

router.post("/", PaymentController.create);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.webhook
);
router.post("/refund/:paymentId", PaymentController.refund);

export default router;