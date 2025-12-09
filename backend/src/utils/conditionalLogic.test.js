import {
  shouldShowQuestion,
  validateConditionalRules,
} from "./conditionalLogic.js";
describe("Conditional Logic Evaluator", () => {
  describe("shouldShowQuestion", () => {
    test("returns true when rules is null", () => {
      expect(shouldShowQuestion(null, {})).toBe(true);
    });
    test("returns true when conditions array is empty", () => {
      expect(shouldShowQuestion({ logic: "AND", conditions: [] }, {})).toBe(
        true
      );
    });
    test("evaluates equals operator correctly", () => {
      const rules = {
        logic: "AND",
        conditions: [
          {
            questionKey: "role",
            operator: "equals",
            value: "Engineer",
          },
        ],
      };
      expect(shouldShowQuestion(rules, { role: "Engineer" })).toBe(true);
      expect(shouldShowQuestion(rules, { role: "Designer" })).toBe(false);
    });
    test("evaluates notEquals operator correctly", () => {
      const rules = {
        logic: "AND",
        conditions: [
          {
            questionKey: "status",
            operator: "notEquals",
            value: "inactive",
          },
        ],
      };
      expect(shouldShowQuestion(rules, { status: "active" })).toBe(true);
      expect(shouldShowQuestion(rules, { status: "inactive" })).toBe(false);
    });
    test("evaluates contains operator for arrays", () => {
      const rules = {
        logic: "AND",
        conditions: [
          {
            questionKey: "skills",
            operator: "contains",
            value: "JavaScript",
          },
        ],
      };
      expect(
        shouldShowQuestion(rules, { skills: ["JavaScript", "Python"] })
      ).toBe(true);
      expect(shouldShowQuestion(rules, { skills: ["Python"] })).toBe(false);
    });
    test("evaluates contains operator for strings", () => {
      const rules = {
        logic: "AND",
        conditions: [
          {
            questionKey: "bio",
            operator: "contains",
            value: "developer",
          },
        ],
      };
      expect(shouldShowQuestion(rules, { bio: "I am a developer" })).toBe(true);
      expect(shouldShowQuestion(rules, { bio: "I am a designer" })).toBe(false);
    });
    test("handles AND logic with multiple conditions", () => {
      const rules = {
        logic: "AND",
        conditions: [
          { questionKey: "role", operator: "equals", value: "Engineer" },
          { questionKey: "experience", operator: "notEquals", value: "junior" },
        ],
      };
      expect(
        shouldShowQuestion(rules, { role: "Engineer", experience: "senior" })
      ).toBe(true);
      expect(
        shouldShowQuestion(rules, { role: "Engineer", experience: "junior" })
      ).toBe(false);
      expect(
        shouldShowQuestion(rules, { role: "Designer", experience: "senior" })
      ).toBe(false);
    });
    test("handles OR logic with multiple conditions", () => {
      const rules = {
        logic: "OR",
        conditions: [
          { questionKey: "role", operator: "equals", value: "Engineer" },
          { questionKey: "role", operator: "equals", value: "Manager" },
        ],
      };
      expect(shouldShowQuestion(rules, { role: "Engineer" })).toBe(true);
      expect(shouldShowQuestion(rules, { role: "Manager" })).toBe(true);
      expect(shouldShowQuestion(rules, { role: "Designer" })).toBe(false);
    });
    test("handles missing answer values gracefully", () => {
      const rules = {
        logic: "AND",
        conditions: [
          { questionKey: "role", operator: "equals", value: "Engineer" },
        ],
      };
      expect(shouldShowQuestion(rules, {})).toBe(false);
      expect(shouldShowQuestion(rules, { otherKey: "value" })).toBe(false);
    });
    test("handles undefined rules gracefully", () => {
      expect(shouldShowQuestion(undefined, {})).toBe(true);
    });
  });
  describe("validateConditionalRules", () => {
    test("returns true for null", () => {
      expect(validateConditionalRules(null)).toBe(true);
    });
    test("validates correct rule structure", () => {
      const validRules = {
        logic: "AND",
        conditions: [
          { questionKey: "role", operator: "equals", value: "Engineer" },
        ],
      };
      expect(validateConditionalRules(validRules)).toBe(true);
    });
    test("rejects invalid logic operator", () => {
      const invalidRules = {
        logic: "XOR",
        conditions: [],
      };
      expect(validateConditionalRules(invalidRules)).toBe(false);
    });
    test("rejects non-array conditions", () => {
      const invalidRules = {
        logic: "AND",
        conditions: "not-an-array",
      };
      expect(validateConditionalRules(invalidRules)).toBe(false);
    });
    test("rejects conditions with invalid operator", () => {
      const invalidRules = {
        logic: "AND",
        conditions: [
          { questionKey: "role", operator: "invalidOp", value: "Engineer" },
        ],
      };
      expect(validateConditionalRules(invalidRules)).toBe(false);
    });
  });
});