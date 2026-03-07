import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getProfile } from "../controllers/user.controller";

const router = express.Router();

router.get("/me", authMiddleware, getProfile);

export default router;