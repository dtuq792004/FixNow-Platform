import express from "express";
import { register } from "../controllers/auth.controller";
import { login } from "../controllers/auth.controller";
import { logoutController } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logoutController);

export default router;