#!/usr/bin/env node
import chalk from "chalk";
import meow from "meow";
import path from "path";
import readPkg from "read-pkg-up";
import { log } from "./log";

const packageJson = readPkg.sync()!.packageJson;
const allArgs = process.argv.slice(2);
const flagSplit = allArgs.indexOf("--");
const ourArgs = flagSplit === -1 ? allArgs : allArgs.slice(0, flagSplit);
const childArgv = flagSplit === -1 ? [] : allArgs.slice(flagSplit + 1);

// todo: this should be auto-generated
const cli = meow(
  `
    ${chalk.underline("sentinel")}: watch require()'d files for changes and restart the application
    version: ${packageJson.version}

    ${chalk.bold("flags")}

             ${chalk.blueBright(
               "--watch"
             )}  An additional list of files to watch for changes, such as json files that aren't loaded by require().

      ${chalk.blueBright("--watch-ignore")}  A list of files to ignore changes in.
            default:  **node_modules**

             ${chalk.blueBright("--debug")}  Whether to log debug messages.

              ${chalk.blueBright("--help")}  Show this help message.

           ${chalk.blueBright("--require")}  A module to preload. Can be repeated.
            example:  @swc/register

        ${chalk.blueBright("--executable")}  Executable used to create the child process.
            default:  node
            example:  ts-node

                 
`,
  {
    argv: ourArgs,
    allowUnknownFlags: false,
    flags: {
      watch: {
        type: "string",
        isRequired: false,
        isMultiple: true,
      },
      require: {
        type: "string",
        alias: "r",
        isRequired: false,
        isMultiple: true,
      },
      watchIgnore: {
        type: "string",
        default: "**node_modules**",
        isRequired: false,
      },
      debug: {
        type: "boolean",
        default: false,
      },
      executable: {
        type: "string",
        default: "node",
      },
      help: {
        type: "boolean",
        default: false,
      },
    },
  }
);

if (cli.flags.help) {
  cli.showHelp();
  process.exit(0);
}

if (!cli.input[0]) {
  log.debug({ flags: cli.flags, input: cli.input });
  log.error("No script path provided");
  cli.showHelp(1);
}

if (cli.input[1]) {
  log.error("Too many arguments provided");
  cli.showHelp(1);
}

// log some useful debug information
for (const key in cli.flags) {
  log.debug(`Flag "${key}" is ${JSON.stringify(cli.flags[key])}`);
}

const scriptPath = path.resolve(cli.input[0]);

export { cli, childArgv as subFlags, scriptPath };
