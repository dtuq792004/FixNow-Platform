import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getProfile } from "../controllers/user.controller";
import { updateProfile, uploadAvatar } from "../controllers/user.controller";
import { uploadImage } from "../middlewares/multer.middleware";
import { uploadImageToCloudinary } from "../middlewares/cloudinary.middleware";

const router = express.Router();

router.get("/me", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post(
  "/avatar",
  authMiddleware,
  uploadImage.single("avatar"),
  uploadImageToCloudinary("avatars"),
  uploadAvatar,
);

export default router;






