function evaluateCondition(condition, answersSoFar) {
  if (!condition || !condition.questionKey) {
    return true; 
  }
  const answerValue = answersSoFar[condition.questionKey];
  const expectedValue = condition.value;
  switch (condition.operator) {
    case "equals":
      return answerValue === expectedValue;
    case "notEquals":
      return answerValue !== expectedValue;
    case "contains":
      if (Array.isArray(answerValue)) {
        return answerValue.includes(expectedValue);
      }
      if (typeof answerValue === "string") {
        return answerValue.includes(expectedValue);
      }
      return false;
    default:
      return true; 
  }
}
export function shouldShowQuestion(rules, answersSoFar) {
  if (!rules || !rules.conditions || rules.conditions.length === 0) {
    return true;
  }
  const conditionResults = rules.conditions.map((condition) =>
    evaluateCondition(condition, answersSoFar)
  );
  if (rules.logic === "OR") {
    return conditionResults.some((result) => result === true);
  }
  return conditionResults.every((result) => result === true);
}
export function validateConditionalRules(rules) {
  if (!rules) return true;
  if (typeof rules !== "object") return false;
  if (!["AND", "OR"].includes(rules.logic)) return false;
  if (!Array.isArray(rules.conditions)) return false;
  return rules.conditions.every((condition) => {
    return (
      condition.questionKey &&
      typeof condition.questionKey === "string" &&
      ["equals", "notEquals", "contains"].includes(condition.operator) &&
      condition.value !== undefined
    );
  });
}