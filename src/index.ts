#!/usr/bin/env ts-node

import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { getConfig } from "./lib/config";
import { getPathsByGlobs } from "./lib/utils";

void (async () => {
  try {
    const cwd = process.cwd();
    const { config } = await getConfig();
    const baseDir = path.resolve(cwd, config.baseDir);
    const argv = await yargs(hideBin(process.argv)).argv;
    const command = !argv._.length ? "apply" : argv._[0];
    const args = argv._.slice(1);

    switch (command) {
      case "apply":
        const globs = !args.length
          ? config.globs
          : args.map((arg) => arg.toString());
        const paths = await getPathsByGlobs({ globs, baseDir });
        if (!paths.length) {
          console.error(
            `No files found by globs ${globs
              .map((g) => `"${g}"`)
              .join(", ")} inside "${baseDir}"`
          );
        }
        for (const filePath of paths) {
          console.info("Applying", filePath);
        }
        break;
      default:
        console.info("Unknown command:", command);
        break;
    }
  } catch (error) {
    console.error(error);
  }
})();
