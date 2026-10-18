import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const blocksDirectory = path.join(root, "html", "blocks");
const files = [
  "01-header.html",
  "02-hero.html",
  "03-catalog.html",
  "04-benefits.html",
  "05-special-offers.html",
  "06-why-changan.html",
  "07-reviews.html",
  "08-personal-cta.html",
  "09-contacts.html",
  "10-footer.html",
];

const parts = [await readFile(path.join(root, "html", "layout", "start.html"), "utf8")];
for (const file of files) parts.push(await readFile(path.join(blocksDirectory, file), "utf8"));
parts.push(await readFile(path.join(root, "html", "layout", "end.html"), "utf8"));

await writeFile(path.join(root, "index.html"), parts.map((part) => part.trim()).join("\n\n") + "\n", "utf8");
console.log("index.html rebuilt from html/blocks.");
