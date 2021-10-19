import { ChildProcess, fork } from "child_process";
import chokidar from "chokidar";
import { cli, scriptPath, subFlags } from "./cli";
import { CHILD_DEBUG_FLAG } from "./constants";
import { log } from "./log";
import { Payload, PayloadType } from "./types";

let child: ChildProcess | undefined;
// scuffed way of resolving the path to the hook script
// fixme: this is likely to break
const hookPath = __filename.replace("index", "hook");
const watcher = chokidar.watch(cli.flags.watch ?? [], {
  ignored: cli.flags.watchIgnore,
});

watcher.on("change", (path) => {
  log.info(`File "${path}" changed, restarting…`);
  respawn();
});

watcher.on("add", (path) => {
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
  // fixme: this should pass other node flags like --enable-source-maps and not just
  // --require flags. to do that we'd have to enable unknown flags then filter for known
  // node flags, but i cant find a way to reliably do that without just listing all the
  // node flags.

  // having "hookPath" go last here is intentional as it means other `-r` loaders
  // add their extensions before our hook is loaded, which is important due to a hack
  // the hook uses.
  const require = cli.flags.require ? [...cli.flags.require, hookPath] : [hookPath];
  const execArgv: string[] = [];
  for (const value of require) execArgv.push("-r", value);

  // fixme: this is an ugly hack to get the child process to be able to use
  // log.debug and properly hide its output when the parent isnt in debug mode.
  // should probably pass this over IPC or something but then you have to buffer
  // debug messages until that event is there or delay loading or some weird shit like that
  if (cli.flags.debug && !subFlags.includes(CHILD_DEBUG_FLAG)) {
    subFlags.push(CHILD_DEBUG_FLAG);
  }

  child = fork(scriptPath, subFlags, {
    stdio: "inherit",
    execArgv: execArgv,
    execPath: cli.flags.executable,
  });

  child.on("message", (message: Payload) => {
    switch (message.type) {
      case PayloadType.WatchFile:
        watcher.add(message.file);
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
  log.debug(`Restarting process…`);
  kill();
  spawn();
}

spawn();
