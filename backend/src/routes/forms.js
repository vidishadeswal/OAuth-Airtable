import express from "express";
import * as formController from "../controllers/formController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get Airtable bases
router.get("/airtable/bases", formController.getAirtableBases);

// Get Airtable tables in a base
router.get("/airtable/bases/:baseId/tables", formController.getAirtableTables);

// Get fields in a table
router.get(
  "/airtable/bases/:baseId/tables/:tableId/fields",
  formController.getTableFields
);

// Form CRUD
router.post("/", formController.createForm);
router.get("/", formController.getUserForms);
router.get("/:formId", formController.getForm);
router.put("/:formId", formController.updateForm);
router.delete("/:formId", formController.deleteForm);

// Form responses
router.post("/:formId/submit", formController.submitFormResponse);
router.get("/:formId/responses", formController.getFormResponses);
router.get("/:formId/responses/:responseId", formController.getResponse);

// Conditional logic evaluation
router.post("/:formId/evaluate-logic", formController.evaluateConditionalLogic);

export default router;
