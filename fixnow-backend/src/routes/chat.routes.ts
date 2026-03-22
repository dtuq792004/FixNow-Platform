import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  uploadChatImage
} from "../controllers/chat.controller";
import { uploadImage } from "../middlewares/multer.middleware";
import { uploadImageToCloudinary } from "../middlewares/cloudinary.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/conversations", getConversations);
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/conversations", createConversation);
router.post("/messages", sendMessage);
router.post(
  "/upload-image",
  uploadImage.single("image"),
  uploadImageToCloudinary("chats"),
  uploadChatImage
);

export default router;
