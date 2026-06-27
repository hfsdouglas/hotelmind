import { build } from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";

build({
  entryPoints: ["src/server.ts"],
  outfile: "dist/server.js",

  bundle: true,
  platform: "node",
  target: "node22",

  format: "esm",

  sourcemap: true,
  minify: false,

  plugins: [nodeExternalsPlugin()],

  alias: {
    "@": "./src",
  },
}).catch(() => process.exit(1));
