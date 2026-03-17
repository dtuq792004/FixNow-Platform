import express from "express";
import { register } from "../controllers/auth.controller";
import { login } from "../controllers/auth.controller";
import { logoutController } from "../controllers/auth.controller";
import {
  forgotPassword,
  resetPassword,
  resetPasswordWithOtp,
  sendOtp,
  refreshToken
} from "../controllers/auth.controller";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logoutController);
router.post("/forgot-password", forgotPassword);
router.post("/send-otp", sendOtp);
router.post("/reset-password/:token", resetPassword);
router.post("/reset-password-otp", resetPasswordWithOtp);
router.post("/refresh-token", refreshToken);


export default router;

