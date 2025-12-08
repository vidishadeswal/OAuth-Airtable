export default {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/*.test.js"],
  testTimeout: 10000,
  collectCoverageFrom: ["src/**/*.js", "!src/**/*.test.js"],
};
