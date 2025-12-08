import express from "express";
import * as webhookController from "../controllers/webhookController.js";
import { authenticateToken } from "../middleware/auth.js";
import { verifyAirtableWebhook } from "../utils/webhookVerification.js";

const router = express.Router();

// Airtable webhook endpoint (public - no auth required, but verify signature)
router.post(
  "/airtable",
  verifyAirtableWebhook,
  webhookController.handleAirtableWebhook
);

// Webhook management endpoints (requires authentication)
router.get("/info", authenticateToken, webhookController.getWebhookInfo);
router.get("/:baseId/list", authenticateToken, webhookController.listWebhooks);
router.post("/create", authenticateToken, webhookController.createWebhook);
router.post("/delete", authenticateToken, webhookController.deleteWebhook);

export default router;
