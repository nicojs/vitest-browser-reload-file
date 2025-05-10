import { createVitest } from "vitest/node";
import fs from "fs/promises";
import path from "path";
import type { RunnerTestCase, RunnerTestSuite } from "vitest";

const context = await createVitest("test", {});

const tmpDir = await fs.mkdtemp("./node_modules/tmp-vitest-");
const setupFile = path.resolve(tmpDir, "setup.js");

await fs.writeFile(setupFile, "globalThis.id = '1';");
context.config.setupFiles = [setupFile];
context.config.deps.inline = [setupFile];
context.projects[0].config.setupFiles = [setupFile];
context.projects[0].config.deps.inline = [setupFile];

await runAndReport();

await fs.writeFile(setupFile, "globalThis.id = '2';");

// Invalide setup file
const module = context.projects[0].server.moduleGraph.getModuleById(setupFile);
if (module) {
  context.projects[0].server.moduleGraph.invalidateModule(module);
}
context.state.filesMap.clear();

await runAndReport();

await context.close();

await fs.rm(tmpDir, { recursive: true, force: true });

function collectTestsFromSuite(suite: RunnerTestSuite): RunnerTestCase[] {
  return suite.tasks.flatMap((task) => {
    if (task.type === "suite") {
      return collectTestsFromSuite(task);
    } else if (task.type === "test") {
      return task;
    } else {
      return [];
    }
  });
}

async function runAndReport() {
  await context.start();

  const tests = context.state
    .getFiles()
    .flatMap((file) => collectTestsFromSuite(file))
    .filter((test) => test.result) // if no result: it was skipped because of bail
    .map(({ name, result }) => `${name}: ${result!.state}`);

  console.log("Tests:", tests);
}
