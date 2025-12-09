import express from "express";
import * as authController from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();
router.get("/oauth-url", authController.getOAuthUrl);
router.get("/airtable/callback", authController.handleOAuthCallback);
router.post("/logout", authenticateToken, authController.logout);
router.get("/me", authenticateToken, authController.getCurrentUser);
export default router;