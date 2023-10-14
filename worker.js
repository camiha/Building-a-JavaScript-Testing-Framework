const fs = require("node:fs");

const mock = require("jest-mock");
const { expect } = require("expect");

exports.runTest = async function (testFile) {
	const code = await fs.promises.readFile(testFile, "utf8");
	const testResult = {
		success: false,
		errorMessage: null,
	};
	try {
		eval(code);
		testResult.success = true;
	} catch (error) {
		testResult.errorMessage = error.message;
	}
	return testResult;
};
