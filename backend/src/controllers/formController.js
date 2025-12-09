import Form from "../models/Form.js";
import Response from "../models/Response.js";
import AirtableClient from "../utils/airtableClient.js";
import { getValidAccessToken } from "./authController.js";
import {
  validateFormResponse,
  mapResponsesToAirtableFields,
} from "../utils/validation.js";
import { shouldShowQuestion } from "../utils/conditionalLogic.js";
export const getAirtableBases = async (req, res) => {
  try {
    console.log("Fetching bases for user:", req.user.userId);
    const accessToken = await getValidAccessToken(req.user.userId);
    console.log(
      "Access token retrieved, length:",
      accessToken ? accessToken.length : 0
    );
    const airtableClient = new AirtableClient(accessToken);
    const bases = await airtableClient.getBases();
    console.log("Bases fetched successfully:", bases.length);
    res.json({ bases });
  } catch (error) {
    console.error("Error fetching bases:", error.message);
    if (error.message === "No OAuth token found") {
      return res.status(401).json({
        error: "Not authenticated with Airtable. Please log in again.",
        code: "NO_OAUTH_TOKEN",
      });
    }
    res.status(500).json({ error: error.message });
  }
};
export const getAirtableTables = async (req, res) => {
  try {
    const { baseId } = req.params;
    const accessToken = await getValidAccessToken(req.user.userId);
    const airtableClient = new AirtableClient(accessToken);
    const tables = await airtableClient.getTables(baseId);
    res.json({ tables });
  } catch (error) {
    console.error("Error fetching tables:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const getTableFields = async (req, res) => {
  try {
    const { baseId, tableId } = req.params;
    const accessToken = await getValidAccessToken(req.user.userId);
    const airtableClient = new AirtableClient(accessToken);
    const fields = await airtableClient.getTableFields(baseId, tableId);
    res.json({ fields });
  } catch (error) {
    console.error("Error fetching fields:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const createForm = async (req, res) => {
  try {
    const {
      name,
      description,
      airtableBaseId,
      airtableTableId,
      baseName,
      tableName,
      questions,
    } = req.body;
    if (
      !name ||
      !airtableBaseId ||
      !airtableTableId ||
      !Array.isArray(questions)
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const form = new Form({
      owner: req.user.userId,
      name,
      description,
      airtableBaseId,
      airtableTableId,
      baseName,
      tableName,
      questions,
    });
    await form.save();
    res.status(201).json(form);
  } catch (error) {
    console.error("Error creating form:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const getForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }
    res.json(form);
  } catch (error) {
    console.error("Error fetching form:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const getUserForms = async (req, res) => {
  try {
    const forms = await Form.find({ owner: req.user.userId }).select(
      "_id name description airtableBaseId airtableTableId createdAt updatedAt"
    );
    res.json({ forms });
  } catch (error) {
    console.error("Error fetching user forms:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const updateForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { name, description, questions, isPublished } = req.body;
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }
    if (form.owner.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this form" });
    }
    if (name) form.name = name;
    if (description) form.description = description;
    if (questions) form.questions = questions;
    if (isPublished !== undefined) form.isPublished = isPublished;
    await form.save();
    res.json(form);
  } catch (error) {
    console.error("Error updating form:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const deleteForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }
    if (form.owner.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this form" });
    }
    await Form.findByIdAndDelete(formId);
    res.json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("Error deleting form:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const submitFormResponse = async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body;
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Invalid answers object" });
    }
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }
    const validation = validateFormResponse(form, answers);
    if (!validation.isValid) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: validation.errors });
    }
    const accessToken = await getValidAccessToken(form.owner);
    const airtableClient = new AirtableClient(accessToken);
    const airtableFields = mapResponsesToAirtableFields(form, answers);
    let airtableRecordId;
    try {
      const airtableRecord = await airtableClient.createRecord(
        form.airtableBaseId,
        form.airtableTableId,
        airtableFields
      );
      airtableRecordId = airtableRecord.id;
    } catch (error) {
      console.error("Failed to create Airtable record:", error.message);
      return res
        .status(500)
        .json({ error: "Failed to save to Airtable", details: error.message });
    }
    const response = new Response({
      formId: form._id,
      airtableRecordId,
      answers,
      submittedBy: req.user.userId || null,
      status: "submitted",
    });
    await response.save();
    res.status(201).json({
      message: "Response submitted successfully",
      responseId: response._id,
      airtableRecordId,
    });
  } catch (error) {
    console.error("Error submitting form response:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const getFormResponses = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }
    const responses = await Response.find({
      formId,
      deletedInAirtable: false,
    })
      .sort({ createdAt: -1 })
      .select("_id answers createdAt status airtableRecordId");
    res.json({ responses });
  } catch (error) {
    console.error("Error fetching responses:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const getResponse = async (req, res) => {
  try {
    const { formId, responseId } = req.params;
    const response = await Response.findOne({
      _id: responseId,
      formId,
    });
    if (!response) {
      return res.status(404).json({ error: "Response not found" });
    }
    res.json(response);
  } catch (error) {
    console.error("Error fetching response:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const evaluateConditionalLogic = async (req, res) => {
  try {
    const { formId } = req.params;
    const { answersSoFar } = req.body;
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }
    const visibleQuestions = form.questions
      .map((question) => ({
        questionKey: question.questionKey,
        visible: shouldShowQuestion(question.conditionalRules, answersSoFar),
      }))
      .filter((q) => q.visible);
    res.json({
      visibleQuestionKeys: visibleQuestions.map((q) => q.questionKey),
    });
  } catch (error) {
    console.error("Error evaluating conditional logic:", error.message);
    res.status(500).json({ error: error.message });
  }
};