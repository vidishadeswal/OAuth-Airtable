import crypto from "crypto";
export function verifyWebhookSignature(body, macHeader, macSecret) {
  if (!macSecret || !macHeader) {
    return false;
  }
  const computedMac = crypto
    .createHmac("sha256", macSecret)
    .update(body, "utf8")
    .digest("base64");
  return crypto.timingSafeEqual(
    Buffer.from(computedMac),
    Buffer.from(macHeader)
  );
}
export const verifyAirtableWebhook = (req, res, next) => {
  try {
    const macSecret = process.env.AIRTABLE_WEBHOOK_MAC_SECRET;
    const contentMac = req.headers["x-airtable-content-mac"];
    const bodyString =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    if (!verifyWebhookSignature(bodyString, contentMac, macSecret)) {
      console.warn("⚠️  Webhook signature verification failed");
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