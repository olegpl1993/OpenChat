import { build } from "esbuild";
import fs from "fs";
import path from "path";

const distRoot = path.resolve("dist");
const distClient = path.join(distRoot, "client");

const buildAll = async () => {
  await build({
    entryPoints: ["server/index.ts"],
    bundle: true,
    minify: true,
    platform: "node",
    format: "cjs",
    target: "node22",
    outfile: path.join(distRoot, "index.cjs"),
  });
  console.log("✔ Server built");

  fs.copyFileSync(".htaccess", path.join(distRoot, ".htaccess"));
  fs.copyFileSync("package.json", path.join(distRoot, "package.json"));
  fs.copyFileSync(".env", path.join(distRoot, ".env"));
  console.log("✔ Assets copied");
};

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
