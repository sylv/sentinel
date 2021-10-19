import chalk from "chalk";

// we can't import cli.ts here because this is used in the hook which
// can't load cli.ts without significantly more effort.

export const log = {
  debug: (message: any) => {
    if (
      // fixme: this will catch --debug flags intended for the subprocess to handle when logging from the hook.
      !process.argv.includes("--debug") && // handles parent process debug logging
      !process.argv.includes("--sentinel_debug") // handles child process debug logging (this is passed from the parent process)
    ) {
      return;
    }

    console.debug(chalk.blueBright("sentinel:debug"), message);
  },
  info: (message: any) => {
    console.info(chalk.greenBright("sentinel:info"), message);
  },
  error: (message: any) => {
    console.error(chalk.redBright("sentinel:error"), message);
  },
};
