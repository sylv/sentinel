import { addHook } from "pirates";
import { log } from "./log";
import { PayloadType, WatchFilePayload } from "./types";

addHook((code, filename) => {
  const payload: WatchFilePayload = {
    type: PayloadType.WatchFile,
    file: filename,
  };

  process.send!(payload);
  return code;
});

log.debug("Hook loaded");
