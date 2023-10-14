import fs from "node:fs";
import { join } from "node:path";
import { cpus } from "node:os";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import JestHasteMap from "jest-haste-map";
import { Worker } from "jest-worker";

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
	const testFiles = hasteFS.matchFilesWithGlob(["**/*.test.js"], root);

	await Promise.all(
		Array.from(testFiles).map(async (testFile) => {
			const testResult = await worker.runTest(testFile);
			console.log(testResult);
		}),
	);
	worker.end();
};

void main();
