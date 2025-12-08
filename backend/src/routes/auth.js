import express from "express";
import * as authController from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get OAuth login URL
router.get("/oauth-url", authController.getOAuthUrl);

// OAuth callback
router.get("/airtable/callback", authController.handleOAuthCallback);

// Logout
router.post("/logout", authenticateToken, authController.logout);

// Get current user
router.get("/me", authenticateToken, authController.getCurrentUser);

export default router;
