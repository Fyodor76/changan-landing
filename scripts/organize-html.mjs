import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = (await readFile(path.join(root, "index.html"), "utf8")).replace(/\r\n/g, "\n");

const definitions = [
  ["01-header.html", "header", 'class="clh__header"'],
  ["02-hero.html", "main", 'class="clh__hero"'],
  ["03-catalog.html", "section", 'class="catalog"'],
  ["04-benefits.html", "section", 'class="why-us"'],
  ["05-special-offers.html", "section", 'class="special-offers"'],
  ["06-why-changan.html", "section", 'class="why-changan"'],
  ["07-reviews.html", "section", 'class="reviews"'],
  ["08-personal-cta.html", "section", 'class="personal-cta"'],
  ["09-contacts.html", "section", 'class="contacts"'],
  ["10-footer.html", "footer", 'class="site-footer"'],
];

const blocks = definitions.map(([file, tag, marker]) => {
  const markerAt = source.indexOf(marker);
  if (markerAt < 0) throw new Error(`Marker not found: ${marker}`);
  const start = source.lastIndexOf(`<${tag}`, markerAt);
  const close = `</${tag}>`;
  const end = source.indexOf(close, markerAt) + close.length;
  if (start < 0 || end < close.length) throw new Error(`Cannot extract ${file}`);
  return { file, start, end, content: source.slice(start, end) };
});

await mkdir(path.join(root, "html", "blocks"), { recursive: true });
await mkdir(path.join(root, "html", "layout"), { recursive: true });

await writeFile(path.join(root, "html", "layout", "start.html"), source.slice(0, blocks[0].start).trimEnd() + "\n", "utf8");
await writeFile(path.join(root, "html", "layout", "end.html"), source.slice(blocks.at(-1).end).trimStart(), "utf8");

for (const block of blocks) {
  await writeFile(path.join(root, "html", "blocks", block.file), block.content.trim() + "\n", "utf8");
}

console.log(`Created ${blocks.length} HTML blocks.`);
