import { build } from "esbuild";
import fs from "fs";
import path from "path";

const distRoot = path.resolve("dist");
const distClient = path.join(distRoot, "client");

const buildAll = async () => {
  // --- Создаем чистый dist ---
  if (fs.existsSync(distRoot)) fs.rmSync(distRoot, { recursive: true, force: true });
  fs.mkdirSync(distClient, { recursive: true });

  // --- Серверный билд ---
  await build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    platform: "node",
    format: "cjs",
    target: "node22",
    outfile: path.join(distRoot, "index.cjs"),
  });
  console.log("✔ Server built");

  // --- Клиентский билд ---
  const result = await build({
    entryPoints: ["src/client/client.js"], // JS с импортом CSS
    bundle: true,
    minify: true,
    platform: "browser",
    format: "esm",
    target: "es2022",
    outdir: distClient,
    entryNames: "[name]-[hash]",
    assetNames: "assets/[name]-[hash]",
    loader: { ".css": "css" },
    metafile: true,
  });

  // --- Находим JS и CSS с хешем ---
  const outputs = Object.keys(result.metafile.outputs).map((f) => path.basename(f));
  const jsFile = outputs.find((f) => f.startsWith("client") && f.endsWith(".js"));
  const cssFile = outputs.find((f) => f.endsWith(".css"));

  // --- Обновляем HTML ---
  const htmlFiles = fs.readdirSync("src/client").filter((f) => f.endsWith(".html"));
  for (const file of htmlFiles) {
    let html = fs.readFileSync(`src/client/${file}`, "utf8");
    if (jsFile) html = html.replace(/client\.js/, jsFile);
    if (cssFile) html = html.replace(/styles\.css/, cssFile);
    fs.writeFileSync(path.join(distClient, file), html);
  }
  console.log("✔ Client built with hashed assets");

  // --- Копирование статических файлов ---
  fs.copyFileSync(".htaccess", path.join(distRoot, ".htaccess"));
  fs.copyFileSync("package.json", path.join(distRoot, "package.json"));
  console.log("✔ Assets copied");
};

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
