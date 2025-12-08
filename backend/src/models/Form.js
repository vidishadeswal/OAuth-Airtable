import mongoose from "mongoose";

const ConditionSchema = new mongoose.Schema(
  {
    questionKey: String,
    operator: {
      type: String,
      enum: ["equals", "notEquals", "contains"],
    },
    value: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const ConditionalRulesSchema = new mongoose.Schema(
  {
    logic: {
      type: String,
      enum: ["AND", "OR"],
    },
    conditions: [ConditionSchema],
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    questionKey: {
      type: String,
      required: true,
    },
    fieldId: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "singleLineText",
        "multilineText",
        "singleSelect",
        "multipleSelect",
        "attachment",
      ],
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    conditionalRules: ConditionalRulesSchema,
    selectOptions: [String], // For single/multi-select fields
  },
  { _id: false }
);

const FormSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    airtableBaseId: {
      type: String,
      required: true,
    },
    airtableTableId: {
      type: String,
      required: true,
    },
    baseName: String,
    tableName: String,
    name: {
      type: String,
      required: true,
    },
    description: String,
    questions: [QuestionSchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Form", FormSchema);
