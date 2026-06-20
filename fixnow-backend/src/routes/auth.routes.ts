import express from "express";
import { 
  register, 
  login, 
  logout, 
  forgotPassword, 
  verifyOtp,
  resetPassword,
  refreshToken,
  changePassword,
  resendVerificationOtp,
  verifyEmail,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";


const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-otp", resendVerificationOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/refresh", refreshToken);
router.patch("/change-password", authMiddleware, changePassword);


export default router;

