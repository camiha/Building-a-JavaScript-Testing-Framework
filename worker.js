const fs = require("node:fs");

exports.runTest = async function (testFile) {
	const code = await fs.promises.readFile(testFile, "utf8");
	const testResult = {
		success: false,
		errorMessage: null,
	};
	try {
		const expect = (received) => ({
			toBe: (expected) => {
				if (received !== expected) {
					throw new Error(`Expected ${received} to be ${expected}`);
				}
				return true;
			},
		});
		eval(code);
		testResult.success = true;
	} catch (error) {
		testResult.errorMessage = error.message;
	}
	return testResult;
};
