/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/tests/unit"],
  testMatch: ["**/*.spec.(ts|js)"],
  moduleFileExtensions: ["ts", "js", "json", "vue"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|scss|sass)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.vue$": "vue-jest",
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.jest.json",
      },
    ],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/unit/setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};

