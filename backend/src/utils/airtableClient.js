import axios from "axios";

const AIRTABLE_API_BASE = "https://api.airtable.com/v0";
const AIRTABLE_API_META_BASE = "https://api.airtable.com/v0/meta";

// Map Airtable field types to supported form field types
const AIRTABLE_FIELD_TYPE_MAP = {
  singleLineText: "singleLineText",
  multilineText: "multilineText",
  singleSelect: "singleSelect",
  multipleSelect: "multipleSelect",
  singleCollaborator: "singleCollaborator",
  multipleCollaborators: "multipleCollaborators",
  checkbox: null, // Not supported
  multipleRecordLinks: null, // Not supported
  date: null, // Not supported
  phoneNumber: null, // Not supported
  email: null, // Not supported
  url: null, // Not supported
  number: null, // Not supported
  percent: null, // Not supported
  duration: null, // Not supported
  rating: null, // Not supported
  formula: null, // Not supported
  rollup: null, // Not supported
  count: null, // Not supported
  lookup: null, // Not supported
  autoNumber: null, // Not supported
  barcode: null, // Not supported
  button: null, // Not supported
  attachment: "attachment",
};

const SUPPORTED_TYPES = [
  "singleLineText",
  "multilineText",
  "singleSelect",
  "multipleSelect",
  "attachment",
];

class AirtableClient {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.client = axios.create({
      baseURL: AIRTABLE_API_BASE,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    this.metaClient = axios.create({
      baseURL: AIRTABLE_API_META_BASE,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Fetch all bases accessible by the user
   */
  async getBases() {
    try {
      const response = await this.metaClient.get("/bases");
      return response.data.bases || [];
    } catch (error) {
      console.error("Error fetching Airtable bases:", error.message);
      throw error;
    }
  }

  /**
   * Fetch all tables in a base
   */
  async getTables(baseId) {
    try {
      const response = await this.metaClient.get(`/bases/${baseId}/tables`);
      return response.data.tables || [];
    } catch (error) {
      console.error("Error fetching Airtable tables:", error.message);
      throw error;
    }
  }

  /**
   * Fetch all fields in a table
   * Filters out unsupported field types
   */
  async getTableFields(baseId, tableId) {
    try {
      const tables = await this.getTables(baseId);
      const table = tables.find((t) => t.id === tableId);

      if (!table) {
        throw new Error(`Table ${tableId} not found in base ${baseId}`);
      }

      // Filter to only supported field types
      const supportedFields = table.fields.filter((field) => {
        return SUPPORTED_TYPES.includes(field.type);
      });

      return supportedFields;
    } catch (error) {
      console.error("Error fetching table fields:", error.message);
      throw error;
    }
  }

  /**
   * Create a new record in Airtable table
   */
  async createRecord(baseId, tableId, fields) {
    try {
      const response = await this.client.post(`/${baseId}/${tableId}`, {
        records: [
          {
            fields: fields,
          },
        ],
      });

      return response.data.records[0];
    } catch (error) {
      console.error("Error creating Airtable record:", error.message);
      throw error;
    }
  }

  /**
   * Update an existing record in Airtable
   */
  async updateRecord(baseId, tableId, recordId, fields) {
    try {
      const response = await this.client.patch(
        `/${baseId}/${tableId}/${recordId}`,
        {
          fields: fields,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating Airtable record:", error.message);
      throw error;
    }
  }

  /**
   * Delete a record from Airtable
   */
  async deleteRecord(baseId, tableId, recordId) {
    try {
      await this.client.delete(`/${baseId}/${tableId}/${recordId}`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting Airtable record:", error.message);
      throw error;
    }
  }

  /**
   * Get a record from Airtable
   */
  async getRecord(baseId, tableId, recordId) {
    try {
      const response = await this.client.get(
        `/${baseId}/${tableId}/${recordId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching Airtable record:", error.message);
      throw error;
    }
  }

  /**
   * List all records in a table (with optional filtering)
   */
  async listRecords(baseId, tableId, options = {}) {
    try {
      const response = await this.client.get(`/${baseId}/${tableId}`, {
        params: options,
      });
      return response.data.records || [];
    } catch (error) {
      console.error("Error listing Airtable records:", error.message);
      throw error;
    }
  }
}

export default AirtableClient;
