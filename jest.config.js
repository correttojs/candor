/* eslint-disable */
process.env.WEBPACK_TOGGLE = {};
module.exports = {
  automock: false,
  moduleNameMapper: {
    "\\.(svg|jpg|webp|ttf|woff|png|gif|scss)$": "<rootDir>/.jest/fileMock.js",
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "graphql"],
  modulePathIgnorePatterns: [
    "<rootDir>/.next",
    "<rootDir>/coverage/",
    "<rootDir>/cypress",
    "<rootDir>/cache",
    "<rootDir>/build",
  ],
  setupFilesAfterEnv: ["<rootDir>/.jest/setupJest.js"],

  transform: {
    "\\.(gql|graphql)$": "jest-transform-graphql",
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  globals: {},
  testEnvironment: "jsdom",
};
