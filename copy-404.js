// copy-404.js  (ESM; у package.json є "type": "module")
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

let scriptDir = dirname(fileURLToPath(import.meta.url));
// якщо раптом покладеш у /scripts, підіймемось на рівень вище
if (basename(scriptDir) === "scripts") {
  scriptDir = dirname(scriptDir);
}

const distDir = join(scriptDir, "dist");
const src = join(distDir, "index.html");
const dst = join(distDir, "404.html");

mkdirSync(distDir, { recursive: true });

if (!existsSync(src)) {
  throw new Error(`Не знайдено ${src}. Спочатку виконай: npm run build`);
}

copyFileSync(src, dst);
console.log("✔ 404.html створено з index.html");
