import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(root, "css", "style.css");
const source = await readFile(sourcePath, "utf8");
const lines = source.split(/\r?\n/);

/** 1-based inclusive ranges, preserving cascade order. */
const parts = [
  ["ui/fonts.css", 1, 23],
  ["blocks/legacy-benefits-offers.css", 24, 313],
  ["blocks/catalog-lineup.css", 314, 827],
  ["blocks/early-motion.css", 828, 1425],
  ["ui/base.css", 1426, 1552],
  ["blocks/header-hero.css", 1553, 2008],
  ["blocks/catalog.css", 2009, 2424],
  ["blocks/offers.css", 2425, 2686],
  ["blocks/benefits.css", 2687, 2876],
  ["blocks/special-offers.css", 2877, 3525],
  ["blocks/personal-cta.css", 3526, 3637],
  ["blocks/reviews.css", 3638, 3836],
  ["blocks/contacts.css", 3837, 3974],
  ["blocks/footer.css", 3975, 4080],
  ["blocks/why-us.css", 4081, 4667],
  ["blocks/models-menu.css", 4668, 5174],
  ["blocks/why-changan.css", 5175, 5934],
  ["blocks/header-chrome.css", 5935, 6466],
  ["blocks/modal.css", 6467, 6826],
  ["blocks/refinements.css", 6827, lines.length],
];

const cssRoot = path.join(root, "css");

for (const [relative, start, end] of parts) {
  const filePath = path.join(cssRoot, relative);
  await mkdir(path.dirname(filePath), { recursive: true });
  const chunk = lines.slice(start - 1, end).join("\n").replace(/\s+$/, "") + "\n";
  await writeFile(filePath, chunk, "utf8");
  console.log(`${relative}: ${end - start + 1} lines`);
}

const imports = [
  "/* Entry stylesheet: import order must stay intact to preserve cascade. */",
  ...parts.map(([relative]) => `@import "./${relative.replace(/\\/g, "/")}";`),
  '@import "./blocks/legal.css";',
  "",
].join("\n");

await writeFile(sourcePath, imports, "utf8");
console.log("css/style.css rewritten as import map.");
