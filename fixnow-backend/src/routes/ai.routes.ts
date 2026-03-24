import { Router } from "express";
import { chat } from "../controllers/ai.controller";
import { authMiddleware } from "../middlewares/auth.middleware"; // (Tùy chọn: chỉ cho user đăng nhập chat)

const router = Router();

// Endpoint Chat AI: Người dùng có thể truyền vào message (text), lịch sử (history) và hình ảnh (imageBase64)
router.post("/chat", authMiddleware, chat);

export default router;
