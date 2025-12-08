import crypto from "crypto";

/**
 * Verify Airtable webhook signature
 * Airtable includes an X-Airtable-Content-MAC header with HMAC-SHA256
 */
export function verifyWebhookSignature(body, macHeader, macSecret) {
  if (!macSecret || !macHeader) {
    return false;
  }

  // Create HMAC signature
  const computedMac = crypto
    .createHmac("sha256", macSecret)
    .update(body, "utf8")
    .digest("base64");

  // Compare signatures
  return crypto.timingSafeEqual(
    Buffer.from(computedMac),
    Buffer.from(macHeader)
  );
}

/**
 * Verify webhook request came from Airtable
 * Use as middleware for webhook endpoint
 */
export const verifyAirtableWebhook = (req, res, next) => {
  try {
    const macSecret = process.env.AIRTABLE_WEBHOOK_MAC_SECRET;
    const contentMac = req.headers["x-airtable-content-mac"];

    // Get raw body for verification
    const bodyString =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    if (!verifyWebhookSignature(bodyString, contentMac, macSecret)) {
      console.warn("⚠️  Webhook signature verification failed");
      // Don't reject in development, but log warning
      if (process.env.NODE_ENV === "production") {
        return res.status(401).json({ error: "Invalid webhook signature" });
      }
    }

    next();
  } catch (error) {
    console.error("Webhook verification error:", error.message);
    res.status(500).json({ error: "Webhook verification failed" });
  }
};
