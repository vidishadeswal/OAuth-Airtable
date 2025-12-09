import axios from "axios";
const AIRTABLE_API_BASE = "https://api.airtable.com/v0";
const AIRTABLE_API_META_BASE = "https://api.airtable.com/v0/meta";
const AIRTABLE_FIELD_TYPE_MAP = {
  singleLineText: "singleLineText",
  multilineText: "multilineText",
  singleSelect: "singleSelect",
  multipleSelect: "multipleSelect",
  singleCollaborator: "singleCollaborator",
  multipleCollaborators: "multipleCollaborators",
  checkbox: null, 
  multipleRecordLinks: null, 
  date: null, 
  phoneNumber: null, 
  email: null, 
  url: null, 
  number: null, 
  percent: null, 
  duration: null, 
  rating: null, 
  formula: null, 
  rollup: null, 
  count: null, 
  lookup: null, 
  autoNumber: null, 
  barcode: null, 
  button: null, 
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
  async getBases() {
    try {
      const response = await this.metaClient.get("/bases");
      return response.data.bases || [];
    } catch (error) {
      console.error("Error fetching Airtable bases:", error.message);
      if (error.response) {
        console.error("Airtable API Error:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      }
      throw error;
    }
  }
  async getTables(baseId) {
    try {
      const response = await this.metaClient.get(`/bases/${baseId}/tables`);
      return response.data.tables || [];
    } catch (error) {
      console.error("Error fetching Airtable tables:", error.message);
      throw error;
    }
  }
  async getTableFields(baseId, tableId) {
    try {
      const tables = await this.getTables(baseId);
      const table = tables.find((t) => t.id === tableId);
      if (!table) {
        throw new Error(`Table ${tableId} not found in base ${baseId}`);
      }
      const supportedFields = table.fields.filter((field) => {
        return SUPPORTED_TYPES.includes(field.type);
      });
      return supportedFields;
    } catch (error) {
      console.error("Error fetching table fields:", error.message);
      throw error;
    }
  }
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
  async deleteRecord(baseId, tableId, recordId) {
    try {
      await this.client.delete(`/${baseId}/${tableId}/${recordId}`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting Airtable record:", error.message);
      throw error;
    }
  }
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