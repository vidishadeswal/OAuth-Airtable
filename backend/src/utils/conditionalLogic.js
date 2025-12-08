/**
 * Pure function to evaluate conditional visibility rules
 * No external dependencies - testable and deterministic
 */

/**
 * @typedef {Object} Condition
 * @property {string} questionKey - Key of the question to check
 * @property {string} operator - 'equals', 'notEquals', or 'contains'
 * @property {any} value - Value to compare against
 */

/**
 * @typedef {Object} ConditionalRules
 * @property {string} logic - 'AND' or 'OR' operator
 * @property {Condition[]} conditions - Array of conditions
 */

/**
 * Evaluates a single condition against the answers so far
 * @param {Condition} condition - The condition to evaluate
 * @param {Record<string, any>} answersSoFar - Object of answers collected so far
 * @returns {boolean} - Result of the condition
 */
function evaluateCondition(condition, answersSoFar) {
  if (!condition || !condition.questionKey) {
    return true; // Invalid condition defaults to true
  }

  const answerValue = answersSoFar[condition.questionKey];
  const expectedValue = condition.value;

  switch (condition.operator) {
    case "equals":
      return answerValue === expectedValue;

    case "notEquals":
      return answerValue !== expectedValue;

    case "contains":
      // For arrays or strings
      if (Array.isArray(answerValue)) {
        return answerValue.includes(expectedValue);
      }
      if (typeof answerValue === "string") {
        return answerValue.includes(expectedValue);
      }
      return false;

    default:
      return true; // Unknown operator defaults to true
  }
}

/**
 * Determines if a question should be shown based on conditional rules
 * @param {ConditionalRules | null} rules - The conditional rules for the question
 * @param {Record<string, any>} answersSoFar - Object of answers collected so far
 * @returns {boolean} - Whether the question should be shown
 */
export function shouldShowQuestion(rules, answersSoFar) {
  // No rules means always show
  if (!rules || !rules.conditions || rules.conditions.length === 0) {
    return true;
  }

  const conditionResults = rules.conditions.map((condition) =>
    evaluateCondition(condition, answersSoFar)
  );

  // Combine results using AND or OR logic
  if (rules.logic === "OR") {
    return conditionResults.some((result) => result === true);
  }

  // Default to AND if not specified or invalid
  return conditionResults.every((result) => result === true);
}

/**
 * Validates the structure of conditional rules (for schema validation)
 * @param {any} rules - The rules object to validate
 * @returns {boolean} - Whether the rules are valid
 */
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
