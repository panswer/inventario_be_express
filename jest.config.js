module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>", "<rootDir>/__tests__"],
  testMatch: ["**/__tests__/**/*.test.js"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.js", "!src/database.js", "!src/testApp.js", "!jest.setup.js"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  testTimeout: 30000,
  verbose: true,
};
