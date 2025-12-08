import axios from "axios";
import Response from "../models/Response.js";
import AirtableClient from "../utils/airtableClient.js";
import { getValidAccessToken } from "./authController.js";
import Form from "../models/Form.js";

/**
 * Handle Airtable webhook events
 * Webhook events include: create, update, delete
 */
export const handleAirtableWebhook = async (req, res) => {
  try {
    // Verify webhook token (optional but recommended)
    const webhookToken = req.headers["x-airtable-webhook-id"];

    // Parse the webhook payload
    const payload = req.body;

    if (!payload || !payload.actionMetadata) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    const { actionMetadata } = payload;
    const { baseId, tableId } = actionMetadata;

    console.log(
      `Webhook event: ${actionMetadata.sourceMetadata.user.id} - Action in ${tableId}`
    );

    // Handle different webhook events
    if (payload.createdTablesById) {
      // Table created
      console.log("Table created event");
    }

    if (payload.createdRecordsById) {
      // Records created
      await handleRecordsCreated(baseId, tableId, payload.createdRecordsById);
    }

    if (payload.destroyedRecordIds) {
      // Records deleted
      await handleRecordsDeleted(baseId, tableId, payload.destroyedRecordIds);
    }

    if (payload.changedMetadata) {
      // Metadata changed (fields updated)
      console.log("Metadata changed event");
    }

    if (payload.changedRecordsById) {
      // Records updated
      await handleRecordsUpdated(baseId, tableId, payload.changedRecordsById);
    }

    // Return success to Airtable
    res.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    // Still return 200 to Airtable to acknowledge receipt
    res.status(200).json({ error: error.message });
  }
};

/**
 * Handle when records are created in Airtable
 * These might be created outside our app
 */
async function handleRecordsCreated(baseId, tableId, createdRecordsById) {
  try {
    // Find form associated with this table
    const form = await Form.findOne({
      airtableBaseId: baseId,
      airtableTableId: tableId,
    });

    if (!form) {
      console.log(`No form found for base ${baseId}, table ${tableId}`);
      return;
    }

    // Note: We might not have the full record data in webhook
    // If needed, we could fetch from Airtable using the recordIds
    console.log(
      `Records created in form ${form._id}:`,
      Object.keys(createdRecordsById)
    );
  } catch (error) {
    console.error("Error handling records created:", error.message);
  }
}

/**
 * Handle when records are updated in Airtable
 */
async function handleRecordsUpdated(baseId, tableId, changedRecordsById) {
  try {
    // Find form associated with this table
    const form = await Form.findOne({
      airtableBaseId: baseId,
      airtableTableId: tableId,
    });

    if (!form) {
      console.log(`No form found for base ${baseId}, table ${tableId}`);
      return;
    }

    // Update responses in our database
    for (const recordId of Object.keys(changedRecordsById)) {
      const response = await Response.findOne({
        airtableRecordId: recordId,
      });

      if (response) {
        // Get the record data from Airtable
        try {
          const accessToken = await getValidAccessToken(form.owner);
          const airtableClient = new AirtableClient(accessToken);

          const airtableRecord = await airtableClient.getRecord(
            baseId,
            tableId,
            recordId
          );

          // Update the response with new data
          response.answers = airtableRecord.fields;
          response.updatedAt = new Date();
          await response.save();

          console.log(
            `Updated response ${response._id} from Airtable record ${recordId}`
          );
        } catch (error) {
          console.error(
            `Failed to fetch record ${recordId} from Airtable:`,
            error.message
          );
        }
      }
    }
  } catch (error) {
    console.error("Error handling records updated:", error.message);
  }
}

/**
 * Handle when records are deleted in Airtable
 */
async function handleRecordsDeleted(baseId, tableId, destroyedRecordIds) {
  try {
    // Find form associated with this table
    const form = await Form.findOne({
      airtableBaseId: baseId,
      airtableTableId: tableId,
    });

    if (!form) {
      console.log(`No form found for base ${baseId}, table ${tableId}`);
      return;
    }

    // Mark responses as deleted in Airtable (soft delete)
    for (const recordId of destroyedRecordIds) {
      await Response.findOneAndUpdate(
        { airtableRecordId: recordId },
        {
          deletedInAirtable: true,
          status: "deleted",
        }
      );

      console.log(
        `Marked response with Airtable record ${recordId} as deleted`
      );
    }
  } catch (error) {
    console.error("Error handling records deleted:", error.message);
  }
}

/**
 * Get webhook information
 */
export const getWebhookInfo = async (req, res) => {
  try {
    const webhookUrl = `${
      process.env.BACKEND_URL || "http://localhost:5000"
    }/api/webhooks/airtable`;

    res.json({
      webhookUrl,
      webhookId: process.env.AIRTABLE_WEBHOOK_ID,
      configured: !!process.env.AIRTABLE_WEBHOOK_ID,
    });
  } catch (error) {
    console.error("Error getting webhook info:", error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * List all webhooks for a base
 * Requires Airtable API access
 */
export const listWebhooks = async (req, res) => {
  try {
    const { baseId } = req.params;

    if (!baseId) {
      return res.status(400).json({ error: "baseId required" });
    }

    const accessToken = await getValidAccessToken(req.user.userId);
    const airtableClient = new AirtableClient(accessToken);

    // Airtable webhooks API endpoint
    const response = await axios.get(
      `https://api.airtable.com/v0/bases/${baseId}/webhooks`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error listing webhooks:", error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a webhook for a base
 */
export const createWebhook = async (req, res) => {
  try {
    const { baseId, tableId } = req.body;

    if (!baseId) {
      return res.status(400).json({ error: "baseId required" });
    }

    const accessToken = await getValidAccessToken(req.user.userId);

    const webhookUrl = `${
      process.env.BACKEND_URL || "http://localhost:5000"
    }/api/webhooks/airtable`;

    // Create webhook via Airtable API
    // According to Airtable docs, the request body should have notificationUrl and specification
    // If tableId is provided, we can scope the webhook to that specific table
    const specification = {
      options: {
        filters: {
          dataTypes: ["tableData"],
        },
      },
    };

    // If tableId is provided, add recordChangeScope to filter by specific table
    if (tableId) {
      specification.options.filters.recordChangeScope = tableId;
    }

    const response = await axios.post(
      `https://api.airtable.com/v0/bases/${baseId}/webhooks`,
      {
        notificationUrl: webhookUrl,
        specification,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Airtable returns id and macSecretBase64 in the response
    const webhookId = response.data.id || response.data.webhook?.id;
    const macSecretBase64 = response.data.macSecretBase64 || response.data.webhook?.macSecretBase64;

    res.status(201).json({
      message: "Webhook created successfully",
      webhookId: webhookId,
      webhookUrl,
      macSecretBase64,
      instructions: [
        "Save these values in your .env file:",
        `AIRTABLE_WEBHOOK_ID=${webhookId}`,
        `AIRTABLE_WEBHOOK_MAC_SECRET=${macSecretBase64}`,
      ],
    });
  } catch (error) {
    console.error("Error creating webhook:", error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a webhook
 */
export const deleteWebhook = async (req, res) => {
  try {
    const { baseId, webhookId } = req.body;

    if (!baseId || !webhookId) {
      return res.status(400).json({ error: "baseId and webhookId required" });
    }

    const accessToken = await getValidAccessToken(req.user.userId);

    await axios.delete(
      `https://api.airtable.com/v0/bases/${baseId}/webhooks/${webhookId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json({ message: "Webhook deleted successfully" });
  } catch (error) {
    console.error("Error deleting webhook:", error.message);
    res.status(500).json({ error: error.message });
  }
};
