import { join } from "node:path";
import { cpus } from "node:os";
import { dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

import JestHasteMap from "jest-haste-map";
import { Worker } from "jest-worker";
import chalk from "chalk";

const main = async () => {
	const root = dirname(fileURLToPath(import.meta.url));
	const worker = new Worker(join(root, "worker.js"), {
		enableWorkerThreads: true,
	});

	const hasteMapOptions = {
		extensions: ["js"],
		maxWorkers: cpus().length,
		id: "test-fw",
		platforms: [],
		rootDir: root,
		roots: [root],
		retainAllFiles: true,
	};

	const hasteMap = new JestHasteMap.default(hasteMapOptions);
	await hasteMap.setupCachePath(hasteMapOptions);

	const { hasteFS } = await hasteMap.build();
	const testFiles = hasteFS.matchFilesWithGlob([
		process.argv[2] ? `**/${process.argv[2]}*` : "**/*.test.js",
	]);

	let hasFailed = false;
	await Promise.all(
		Array.from(testFiles).map(async (testFile) => {
			const { success, errorMessage } = await worker.runTest(testFile);
			const status = success
				? chalk.green.inverse.bold(" PASS ")
				: chalk.red.inverse.bold(" FAIL ");

			console.log(`${status} ${chalk.dim(relative(root, testFile))}`);
			if (!success) {
				console.log(`test failed: ${errorMessage}`);
			}
		}),
	);
	worker.end();
	if (hasFailed) {
		console.log(
			`\n${chalk.red.bold(
				"Test run failed, please fix all the failing tests.",
			)}`,
		);
		// Set an exit code to indicate failure.
		process.exitCode = 1;
	}
};

void main();
