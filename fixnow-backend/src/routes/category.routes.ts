import express from "express";
import * as categoryController from "../controllers/category.controller";

const router = express.Router();

router.post("/", categoryController.createCategory);
router.get("/", categoryController.getCategories);
router.get("/stats", categoryController.getCategoriesWithStats);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;