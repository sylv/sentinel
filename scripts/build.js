/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/index.ts", "src/hook.ts"],
  bundle: true,
  sourcemap: true,
  platform: "node",
  outdir: "dist",
});
