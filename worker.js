const fs = require("node:fs");

const { expect } = require("expect");
const mock = require("jest-mock");
// Provide `describe` and `it` to tests.
const { describe, it, run, resetState } = require("jest-circus");

exports.runTest = async function (testFile) {
	const code = await fs.promises.readFile(testFile, "utf8");
	const testResult = {
		success: false,
		errorMessage: null,
	};
	try {
		resetState();
		eval(code);
		const { testResults } = await run();
		testResult.testResults = testResults;
		testResult.success = testResults.every((result) => !result.errors.length);
	} catch (error) {
		testResult.errorMessage = error.message;
	}
	return testResult;
};
