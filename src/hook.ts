import Module from "module";
import { addHook } from "pirates";
import { log } from "./log";
import { PayloadType, WatchFilePayload } from "./types";

function getExtensions() {
  // fixme: disgusting hack to get around pirates requiring a list of extensions.
  // this requires the hook to be loaded last and is generally a huge pain in the ass.
  // we should either find a better way to do this or just not use pirates, this is already
  // not the intended use case for it.
  const extensions: string[] = Object.keys((Module as any)._extensions);
  log.debug(`Supported extensions`, extensions);
  return extensions;
}

function hook(code: string, filename: string): string {
  const payload: WatchFilePayload = {
    type: PayloadType.WatchFile,
    file: filename,
  };

  process.send!(payload);
  return code;
}

addHook(hook, {
  ignoreNodeModules: false,
  exts: getExtensions(),
});

log.debug("Hook loaded");
