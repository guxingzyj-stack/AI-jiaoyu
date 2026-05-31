import fs from "node:fs";
import path from "node:path";

const roots = ["app", "components", "lib"];
const assetPattern = /\/assets\/[A-Za-z0-9_./?=&%-]+/g;
const references = new Map();

function walk(dir) {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!/\.(tsx?|jsx?|css|mjs)$/.test(entry.name)) continue;

    const source = fs.readFileSync(fullPath, "utf8");
    for (const match of source.matchAll(assetPattern)) {
      const assetPath = match[0].split("?")[0];
      if (!references.has(assetPath)) references.set(assetPath, new Set());
      references.get(assetPath).add(fullPath);
    }
  }
}

for (const root of roots) walk(root);

const missing = [];
const entries = [...references.entries()].sort(([a], [b]) => a.localeCompare(b));

for (const [assetPath, files] of entries) {
  const publicPath = path.join("public", assetPath.replace(/^\//, ""));
  const exists = fs.existsSync(publicPath);
  const label = exists ? "OK" : "MISSING";
  console.log(`${label} ${assetPath} <- ${[...files].join(", ")}`);
  if (!exists) missing.push(assetPath);
}

console.log(`\nChecked ${entries.length} asset reference(s).`);

if (missing.length > 0) {
  console.error(`Missing asset(s): ${missing.join(", ")}`);
  process.exitCode = 1;
}
