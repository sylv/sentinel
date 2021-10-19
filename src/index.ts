import { ChildProcess, fork } from "child_process";
import chokidar from "chokidar";
import { cli, scriptPath, subFlags } from "./cli";
import { log } from "./log";
import { Payload, PayloadType } from "./types";

let child: ChildProcess | undefined;
// scuffed way of resolving the path to the hook script
// fixme: this is likely to break
const hookPath = __filename.replace("index", "hook");
const watch = chokidar.watch(cli.flags.watch ?? [], {
  ignored: cli.flags.watchIgnore || undefined,
});

watch.on("change", (path) => {
  log.info(`File "${path}" changed, restarting…`);
  respawn();
});

watch.on("add", (path) => {
  log.debug(`Added "${path}" to the watch list`);
});

function kill() {
  if (child) {
    log.debug(`Killing child process`);
    child.kill();
    child.removeAllListeners();
    child = undefined;
  }
}

function spawn() {
  if (child) kill();
  log.debug(`Forking "${hookPath}" (scriptPath: "${scriptPath}")`);
  // todo: this should pass other node flags like --enable-source-maps and not just
  // --require flags. to do that we'd have to enable unknown flags then filter for known
  // node flags, but i cant find a way to reliably do that without just listing all the
  // node flags.
  const require = cli.flags.require ? [hookPath, ...cli.flags.require] : [hookPath];
  const execArgv: string[] = [];
  for (const value of require) execArgv.push("-r", value);
  child = fork(scriptPath, subFlags, {
    stdio: "inherit",
    execArgv: execArgv,
    execPath: cli.flags.executable,
  });

  // sometimes the main hook doesnt send the entry point to the parent,
  // so this makes absolutely sure that we watch the entry point script.
  watch.add(scriptPath);

  child.on("message", (message: Payload) => {
    switch (message.type) {
      case PayloadType.WatchFile:
        watch.add(message.file);
        break;
    }
  });

  child.on("exit", (code) => {
    if (code === 0) log.info(`Child exited, waiting for changes to restart…`);
    else log.error(`Child crashed with exit code ${code}, waiting for changes to restart…`);
    kill();
  });

  return child;
}

function respawn() {
  kill();
  log.debug(`Restarting process`);
  spawn();
}

spawn();
