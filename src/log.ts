import chalk from "chalk";
import { CHILD_DEBUG_FLAG } from "./constants";

// we can't import cli.ts here because this is used in the hook which
// can't load cli.ts without significantly more effort.

export const log = {
  debug: (...args: any[]) => {
    if (
      // fixme: this will catch --debug flags intended for the subprocess to handle when logging from the hook.
      !process.argv.includes("--debug") && // handles parent process debug logging
      !process.argv.includes(CHILD_DEBUG_FLAG) // handles child process debug logging (this is passed from the parent process)
    ) {
      return;
    }

    console.debug(chalk.blueBright("sentinel:debug"), ...args);
  },
  info: (...args: any[]) => {
    console.info(chalk.greenBright("sentinel:info"), ...args);
  },
  error: (...args: any[]) => {
    console.error(chalk.redBright("sentinel:error"), ...args);
  },
};
