/**
 * Validates form response data against form schema
 */

export function validateFormResponse(formData, responseData) {
  const errors = [];

  // Check required fields
  formData.questions.forEach((question) => {
    const answer = responseData[question.questionKey];

    if (
      question.required &&
      (answer === undefined || answer === null || answer === "")
    ) {
      errors.push(`${question.label} is required`);
    }

    // Type-specific validation
    if (answer !== undefined && answer !== null && answer !== "") {
      switch (question.type) {
        case "singleSelect":
          if (
            question.selectOptions &&
            !question.selectOptions.includes(answer)
          ) {
            errors.push(`Invalid option for ${question.label}`);
          }
          break;

        case "multipleSelect":
          if (!Array.isArray(answer)) {
            errors.push(`${question.label} must be an array`);
          } else if (
            question.selectOptions &&
            !answer.every((opt) => question.selectOptions.includes(opt))
          ) {
            errors.push(`Invalid option(s) for ${question.label}`);
          }
          break;

        case "singleLineText":
        case "multilineText":
          if (typeof answer !== "string") {
            errors.push(`${question.label} must be text`);
          }
          break;

        case "attachment":
          // File validation would happen on frontend
          // Here we just ensure it's provided if required
          break;
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Maps form responses to Airtable record fields
 * Form question keys should match Airtable field IDs
 */
export function mapResponsesToAirtableFields(formData, responseData) {
  const airtableFields = {};

  formData.questions.forEach((question) => {
    const answer = responseData[question.questionKey];

    if (answer !== undefined && answer !== null) {
      // Use Airtable field ID as key
      airtableFields[question.fieldId] = answer;
    }
  });

  return airtableFields;
}
