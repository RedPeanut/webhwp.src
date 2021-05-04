// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
	browser: true,
	resetMocks: true,
	setupFiles: ["<rootDir>/workspace/test/__mocks__/dom.js"],
	moduleNameMapper: {
		"^@static(.*)$": "<rootDir>/workspace/static$1",
		"^@src(.*)$": "<rootDir>/workspace/src$1",
		"^@test(.*)$": "<rootDir>/workspace/test$1"
	},
	testMatch: [
		"<rootDir>/workspace/test/hwp/**/*.test.js",
	]
};
