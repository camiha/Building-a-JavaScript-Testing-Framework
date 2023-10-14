const fs = require("node:fs");

const mock = require("jest-mock");
const { expect } = require("expect");

exports.runTest = async function (testFile) {
	const code = await fs.promises.readFile(testFile, "utf8");
	const testResult = {
		success: false,
		errorMessage: null,
	};
	let testName;
	try {
		const describeFns = [];
		let currentDescribeFn;
		const describe = (name, fn) => describeFns.push([name, fn]);
		const it = (name, fn) => currentDescribeFn.push([name, fn]);
		eval(code);
		for (const [name, fn] of describeFns) {
			currentDescribeFn = [];
			testName = name;
			fn();

			currentDescribeFn.forEach(([name, fn]) => {
				testName += ` ${name}`;
				fn();
			});
		}
		testResult.success = true;
	} catch (error) {
		testResult.errorMessage = `${testName}: ${error.message}`;
	}
	return testResult;
};
