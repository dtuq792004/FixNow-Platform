import express from "express";
import * as categoryController from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { uploadImage } from "../middlewares/multer.middleware";
import { uploadImageToCloudinary } from "../middlewares/cloudinary.middleware";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("ADMIN"), categoryController.createCategory);
router.post(
  "/upload-icon",
  authMiddleware,
  roleMiddleware("ADMIN"),
  uploadImage.single("image"),
  uploadImageToCloudinary("categories"),
  categoryController.uploadCategoryIcon,
);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), categoryController.updateCategory);
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), categoryController.deleteCategory);

export default router;
