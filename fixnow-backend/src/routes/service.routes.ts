import express from "express";
import {
  createServiceController,
  getServicesController,
  getServicesByCategoryController,
  getMyServicesController,
  updateServiceController,
  deleteServiceController,
  approveServiceController,
  rejectServiceController,
  uploadServiceImageController
} from "../controllers/service.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { uploadImage } from "../middlewares/multer.middleware";
import { uploadImageToCloudinary } from "../middlewares/cloudinary.middleware";

const router = express.Router();

// public
router.get("/", getServicesController);
router.get("/category/:categoryId", getServicesByCategoryController);

// provider
router.get("/provider/me", authMiddleware, roleMiddleware("PROVIDER"), getMyServicesController);
router.post(
  "/provider/upload-image",
  authMiddleware,
  roleMiddleware("PROVIDER"),
  uploadImage.single("image"),
  uploadImageToCloudinary("services"),
  uploadServiceImageController
);
router.post("/", authMiddleware, roleMiddleware("PROVIDER"), createServiceController);
router.put("/:id", authMiddleware, roleMiddleware("PROVIDER"), updateServiceController);
router.delete("/:id", authMiddleware, roleMiddleware("PROVIDER"), deleteServiceController);

// admin
router.patch("/:id", authMiddleware, approveServiceController);
router.patch("/:id/reject", authMiddleware, rejectServiceController);

export default router;
