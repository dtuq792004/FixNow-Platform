import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser
} from "../controllers/adminUser.controller";
import * as adminController from "../controllers/admin.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import * as blogController from "../controllers/blog.controller";
import { uploadImage } from "../middlewares/multer.middleware";
import { uploadImageToCloudinary } from "../middlewares/cloudinary.middleware";

const router = Router();
router.use(authMiddleware, roleMiddleware("ADMIN"));

/**
 * ADMIN routes
 */

router.get(
  "/users",
  getUsers
);

router.get(
  "/users/:id",
  getUserById
);

router.patch(
  "/users/:id/status",
  updateUserStatus
);

router.delete(
  "/users/:id",
  deleteUser
);

router.get("/dashboard", adminController.getDashboard);
router.get("/categories", adminController.getCategories);
router.get("/services", adminController.getServices);
router.get("/requests", adminController.getRequests);
router.get("/payments", adminController.getPayments);
router.get("/feedbacks", adminController.getFeedbacks);
router.patch("/feedbacks/:id/status", adminController.updateFeedbackStatus);
router.get("/complaints", adminController.getComplaints);
router.patch("/complaints/:id/status", adminController.updateComplaintStatus);
router.get("/reports", adminController.getAnalytics);
router.get("/reports/blog-views", adminController.getBlogViewReport);
router.get("/reports/revenue", adminController.getRevenueReport);
router.get("/reports/catalog", adminController.getCatalogReport);
router.get("/settings", adminController.getSettings);
router.patch("/settings", adminController.updateSettings);
router.post("/admins", adminController.createAdmin);
router.get("/blogs", blogController.listAdminBlogs);
router.get("/blogs/:id", blogController.getAdminBlog);
router.post("/blogs", blogController.createBlog);
router.put("/blogs/:id", blogController.updateBlog);
router.delete("/blogs/:id", blogController.deleteBlog);
router.post(
  "/blogs/upload-image",
  uploadImage.single("image"),
  uploadImageToCloudinary("blogs"),
  blogController.uploadBlogImage,
);

export default router;
