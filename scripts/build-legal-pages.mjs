import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const pages = [
  {
    file: "privacy-policy.html",
    source: "tmp-privacy-policy.txt",
    title: "Политика конфиденциальности",
  },
  {
    file: "personal-data-policy.html",
    source: "tmp-personal-data-policy.txt",
    title: "Обработка персональных данных",
  },
  {
    file: "personal-data-consent.html",
    source: "tmp-personal-data-consent.txt",
    title: "Согласие на обработку персональных данных",
  },
  {
    file: "cookie.html",
    source: "tmp-cookie-agreement.txt",
    title: "Соглашение об использовании cookie-файлов",
  },
];

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const isSectionHeading = (line) => {
  const match = line.match(/^\d+\.\s+(.+)$/);
  if (!match || /^\d+\.\d+/.test(line)) return false;

  const letters = match[1].replace(/[^А-Яа-яЁёA-Za-z]/g, "");
  if (!letters || letters.length > 70) return false;

  const upperCount = (letters.match(/[А-ЯЁA-Z]/g) || []).length;
  return upperCount / letters.length >= 0.75;
};

const renderBody = (paragraphs) => {
  const [, ...rest] = paragraphs;
  return rest
    .map((line) => {
      const text = escapeHtml(line);
      if (isSectionHeading(line)) return `<h2>${text}</h2>`;
      if (/^[-•]/.test(line)) return `<p class="legal-doc__bullet">${text}</p>`;
      return `<p>${text}</p>`;
    })
    .join("\n          ");
};

for (const page of pages) {
  const paragraphs = (await readFile(path.join(root, page.source), "utf8"))
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const title = paragraphs[0] || page.title;
  const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="./css/legal.css" />
    <title>${escapeHtml(title)} — Changan Центр Лидер</title>
  </head>
  <body class="legal-page">
    <header class="legal-page__header">
      <div class="clh__container legal-page__top">
        <a class="legal-page__brand" href="./index.html" aria-label="На главную Changan">
          <img
            class="clh__brand-logo"
            src="./assets/Логотип  2.png"
            alt=""
          />
          <span>Чанган Центр Лидер</span>
        </a>
        <a class="legal-page__back" href="./index.html">На главную</a>
      </div>
    </header>

    <main class="legal-doc">
      <div class="clh__container">
        <article class="legal-doc__card">
          <h1>${escapeHtml(title)}</h1>
          ${renderBody(paragraphs)}
        </article>
      </div>
    </main>

    <footer class="site-footer legal-page__footer">
      <div class="clh__container">
        <div class="site-footer__bottom">
          <span>© Changan Automobile Group, 2026</span>
          <nav aria-label="Юридическая информация">
            <a href="./privacy-policy.html">Политика конфиденциальности</a>
            <a href="./personal-data-policy.html">Обработка персональных данных</a>
            <a href="./personal-data-consent.html">Согласие на обработку персональных данных</a>
            <a href="./cookie.html">Cookie</a>
          </nav>
        </div>
      </div>
    </footer>
  </body>
</html>
`;

  await writeFile(path.join(root, page.file), html, "utf8");
  console.log("wrote", page.file);
}
