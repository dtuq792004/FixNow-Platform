import express from "express";
import {
  createServiceController,
  getServicesController,
  getServicesByCategoryController,
  updateServiceController,
  deleteServiceController,
  approveServiceController,
  rejectServiceController
} from "../controllers/service.controller";

import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

// public
router.get("/", getServicesController);
router.get("/category/:categoryId", getServicesByCategoryController);

// provider
router.post("/", authMiddleware, createServiceController);
router.put("/:id", authMiddleware, updateServiceController);
router.delete("/:id", authMiddleware, deleteServiceController);

// admin
router.patch("/:id", authMiddleware, approveServiceController);
router.patch("/:id/reject", authMiddleware, rejectServiceController);

export default router;