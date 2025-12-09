import mongoose from "mongoose";
const ResponseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    airtableRecordId: {
      type: String,
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "deleted"],
      default: "submitted",
    },
    deletedInAirtable: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
export default mongoose.model("Response", ResponseSchema);