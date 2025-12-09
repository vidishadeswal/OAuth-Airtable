export function validateFormResponse(formData, responseData) {
  const errors = [];
  formData.questions.forEach((question) => {
    const answer = responseData[question.questionKey];
    if (
      question.required &&
      (answer === undefined || answer === null || answer === "")
    ) {
      errors.push(`${question.label} is required`);
    }
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
          break;
      }
    }
  });
  return {
    isValid: errors.length === 0,
    errors,
  };
}
export function mapResponsesToAirtableFields(formData, responseData) {
  const airtableFields = {};
  formData.questions.forEach((question) => {
    const answer = responseData[question.questionKey];
    if (answer !== undefined && answer !== null) {
      airtableFields[question.fieldId] = answer;
    }
  });
  return airtableFields;
}