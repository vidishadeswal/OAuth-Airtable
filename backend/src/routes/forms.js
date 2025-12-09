import express from "express";
import * as formController from "../controllers/formController.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();
router.use(authenticateToken);
router.get("/airtable/bases", formController.getAirtableBases);
router.get("/airtable/bases/:baseId/tables", formController.getAirtableTables);
router.get(
  "/airtable/bases/:baseId/tables/:tableId/fields",
  formController.getTableFields
);
router.post("/", formController.createForm);
router.get("/", formController.getUserForms);
router.get("/:formId", formController.getForm);
router.put("/:formId", formController.updateForm);
router.delete("/:formId", formController.deleteForm);
router.post("/:formId/submit", formController.submitFormResponse);
router.get("/:formId/responses", formController.getFormResponses);
router.get("/:formId/responses/:responseId", formController.getResponse);
router.post("/:formId/evaluate-logic", formController.evaluateConditionalLogic);
export default router;