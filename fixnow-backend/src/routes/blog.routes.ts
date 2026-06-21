import { Router } from "express";
import * as blogController from "../controllers/blog.controller";

const router = Router();

router.get("/", blogController.listPublishedBlogs);
router.get("/:slug/reviews", blogController.getBlogReviews);
router.post("/:slug/reviews", blogController.createBlogReview);
router.get("/:slug", blogController.getPublishedBlog);

export default router;
