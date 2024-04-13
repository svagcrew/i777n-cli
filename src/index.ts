#!/usr/bin/env ts-node

import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { applyToAll } from "./lib/apply";
import { getConfigCore } from "./lib/config";

void (async () => {
  try {
    const argv = await yargs(hideBin(process.argv)).argv;
    const knownCommands = ["apply"];
    const { command, args } = (() => {
      if (!argv._.length) return { command: "apply", args: [] };
      if (knownCommands.includes(argv._[0].toString())) {
        return { command: argv._[0].toString(), args: argv._.slice(1) };
      }
      return { command: "apply", args: argv._ };
    })();

    const cwd = process.cwd();
    const { configCore } = await getConfigCore({
      dirPath: cwd,
    });

    switch (command) {
      case "apply":
        await applyToAll({
          globs: args.map((arg) => arg.toString()),
          configCore,
        });
        break;
      default:
        console.info("Unknown command:", command);
        break;
    }
  } catch (error) {
    console.error(error);
  }
})();

// TODO: Errory, deepMap, Eslint as self projects
// TODO: generate meta file
// TODO: translate all
// TODO: translate only changed
// TODO: respect changed manually in translations
// TODO: typograf
// TODO: genereate index file
