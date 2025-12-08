import type { ConditionalRule, FormFieldConfig } from "./api"

export function evaluateConditions(
  rules: ConditionalRule[],
  formData: Record<string, unknown>,
  fields: FormFieldConfig[],
): boolean {
  if (rules.length === 0) return true

  let result = evaluateRule(rules[0], formData, fields)

  for (let i = 1; i < rules.length; i++) {
    const rule = rules[i]
    const ruleResult = evaluateRule(rule, formData, fields)

    if (rule.logic === "AND") {
      result = result && ruleResult
    } else {
      result = result || ruleResult
    }
  }

  return result
}

function evaluateRule(rule: ConditionalRule, formData: Record<string, unknown>, fields: FormFieldConfig[]): boolean {
  const field = fields.find((f) => f.fieldId === rule.sourceFieldId)
  if (!field) return true

  const value = formData[rule.sourceFieldId]
  const compareValue = rule.value

  switch (rule.operator) {
    case "equals":
      if (Array.isArray(value)) {
        return value.includes(compareValue)
      }
      return String(value) === compareValue
    case "notEquals":
      if (Array.isArray(value)) {
        return !value.includes(compareValue)
      }
      return String(value) !== compareValue
    case "contains":
      if (Array.isArray(value)) {
        return value.some((v) => String(v).includes(compareValue))
      }
      return String(value || "").includes(compareValue)
    default:
      return true
  }
}
