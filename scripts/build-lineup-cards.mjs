import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const indexPath = path.join(root, "index.html");

const photos = {
  uniS: [
    "./assets/model-uni-s.jpg",
    "./assets/model-uni-s-2.jpg",
    "./assets/model-uni-s-3.jpg",
    "./assets/model-uni-s.jpg",
  ],
  cs75pro: [
    "./assets/881c3fa9-a324-4830-bace-687386982736.png",
    "./assets/model-cs75pro.jpg",
    "./assets/model-cs75pro-2.jpg",
    "./assets/model-cs75pro-3.jpg",
  ],
  cs35max: [
    "./assets/model-cs35max.jpg",
    "./assets/model-cs35max-2.jpg",
    "./assets/model-cs35max-3.jpg",
    "./assets/model-cs35max.jpg",
  ],
  cs75plus: [
    "./assets/Стильный Changan CS75 PLUS в синей студии.png",
    "./assets/Серый Changan CS75 PLUS сзади.png",
    "./assets/03e583c1-dfc0-49d7-a991-abe183e617b9.png",
    "./assets/Стильный Changan CS75 PLUS в синей студии.png",
  ],
  cs75plusAlt: [
    "./assets/Стильный Changan CS75 PLUS в синей студии.png",
    "./assets/03e583c1-dfc0-49d7-a991-abe183e617b9.png",
    "./assets/model-cs75pro.jpg",
    "./assets/Стильный Changan CS75 PLUS в синей студии.png",
  ],
  cs35maxAlt: [
    "./assets/model-cs35max-2.jpg",
    "./assets/model-cs35max-3.jpg",
    "./assets/model-cs35max.jpg",
    "./assets/model-cs35max-2.jpg",
  ],
  uniSAlt: [
    "./assets/model-uni-s-2.jpg",
    "./assets/model-uni-s-3.jpg",
    "./assets/model-uni-s.jpg",
    "./assets/model-uni-s-2.jpg",
  ],
};

const swatchesDefault = [
  ["Графитовый серый", "#52585c"],
  ["Белый", "#e7e7e5"],
  ["Серебристый", "#aeb1b3"],
  ["Чёрный", "#202224"],
];

/** @type {Array<{
 *  key: string,
 *  category: string,
 *  menuCategory: string,
 *  short: string,
 *  name: string,
 *  engine: string,
 *  gearbox: string,
 *  power: string,
 *  fuel: string,
 *  warranty: string,
 *  price: string,
 *  priceLabel?: string,
 *  color: string,
 *  swatches: string[][],
 *  photos: string[],
 * }>} */
const models = [
  {
    key: "uni-s-4x4",
    category: "Кроссоверы",
    menuCategory: "crossovers",
    short: "Чанган UNI-S 4×4",
    name: "Чанган UNI-S 4×4",
    engine: "1,5Т",
    gearbox: "7DCT",
    power: "280 Н·м / 181 л.с.",
    fuel: "5,9 л / 100 км",
    warranty: "5 лет / 150 000 км",
    price: "2 799 900",
    color: "Белый",
    swatches: [
      ["Белый", "#e7e7e5"],
      ["Звёздный серый", "#6f777d"],
      ["Серебристый", "#aeb1b3"],
      ["Чёрный", "#202224"],
    ],
    photos: ["./assets/studio-uni-s-4x4.png", ...photos.uniS],
  },
  {
    key: "uni-s",
    category: "Кроссоверы",
    menuCategory: "crossovers",
    short: "Чанган UNI-S",
    name: "Чанган UNI-S",
    engine: "1,5Т",
    gearbox: "7DCT",
    power: "280 Н·м / 181 л.с.",
    fuel: "5,9 л / 100 км",
    warranty: "5 лет / 150 000 км",
    price: "2 390 000",
    color: "Чёрный",
    swatches: [
      ["Чёрный", "#202224"],
      ["Белый", "#e7e7e5"],
      ["Звёздный серый", "#6f777d"],
      ["Серебристый", "#aeb1b3"],
    ],
    photos: ["./assets/studio-cs35-max.png", ...photos.uniS],
  },
  {
    key: "uni-k",
    category: "Кроссоверы",
    menuCategory: "crossovers",
    short: "Чанган UNI-K",
    name: "Чанган UNI-K",
    engine: "2,0Т",
    gearbox: "8АТ",
    power: "380 Н·м / 226 л.с.",
    fuel: "8,4 л / 100 км",
    warranty: "5 лет / 150 000 км",
    price: "3 110 000",
    color: "Белый",
    swatches: [
      ["Белый", "#e7e7e5"],
      ["Графитовый серый", "#52585c"],
      ["Серебристый", "#aeb1b3"],
      ["Чёрный", "#202224"],
    ],
    photos: [
      "./assets/Стильный Changan CS75 PLUS в синей студии.png",
      ...photos.cs75plus,
    ],
  },
  {
    key: "uni-t",
    category: "Кроссоверы",
    menuCategory: "crossovers",
    short: "Чанган UNI-T",
    name: "Чанган UNI-T",
    engine: "1,5Т",
    gearbox: "7DCT",
    power: "280 Н·м / 167 л.с.",
    fuel: "6,1 л / 100 км",
    warranty: "5 лет / 150 000 км",
    price: "2 599 900",
    color: "Белый",
    swatches: [
      ["Белый", "#e7e7e5"],
      ["Графитовый серый", "#52585c"],
      ["Серебристый", "#aeb1b3"],
      ["Чёрный", "#202224"],
    ],
    photos: photos.uniSAlt,
  },
  {
    key: "uni-v",
    category: "Седаны",
    menuCategory: "sedans",
    short: "Чанган UNI-V",
    name: "Чанган UNI-V",
    engine: "1,5Т",
    gearbox: "7DCT",
    power: "300 Н·м / 181 л.с.",
    fuel: "6,2 л / 100 км",
    warranty: "5 лет / 150 000 км",
    price: "2 530 000",
    color: "Серебристый",
    swatches: swatchesDefault,
    photos: photos.uniS,
  },
  {
    key: "cs75-pro",
    category: "Кроссоверы",
    menuCategory: "crossovers",
    short: "Чанган CS75 PRO",
    name: "Чанган CS75 PRO",
    engine: "1,5Т",
    gearbox: "7DCT",
    power: "300 Н·м / 188 л.с.",
    fuel: "7,3 л / 100 км",
    warranty: "5 лет / 150 000 км",
    price: "2 700 000",
    color: "Графитовый серый",
    swatches: swatchesDefault,
    photos: photos.cs75pro,
  },
  {
    key: "cs75-plus",
    category: "Внедорожники",
    menuCategory: "suv",
    short: "Чанган CS75 PLUS",
    name: "Чанган CS75 PLUS",
    engine: "2,0 / 1,5Т",
    gearbox: "8АТ",
    power: ["380 Н·м / 226 л.с.", "280 Н·м / 181 л.с."],
    fuel: "7,0 л / 100 км",
    warranty: "5 лет / 150 000 км",
    price: "2 599 000",
    color: "Серебристый",
    swatches: swatchesDefault,
    photos: photos.cs75plus,
  },
  {
    key: "cs75-plus-new",
    category: "Внедорожники",
    menuCategory: "suv",
    short: "Чанган CS75 PLUS NEW",
    name: "Чанган CS75 PLUS NEW",
    engine: "2,0Т",
    gearbox: "8АТ",
    power: "390 Н·м / 235 л.с.",
    fuel: "8,8 л / 100 км",
    warranty: "5 лет / 150 000 км",
    price: "3 300 000",
    color: "Серебристый",
    swatches: swatchesDefault,
    photos: photos.cs75plusAlt,
  },
  {
    key: "cs35-max",
    category: "Кроссоверы",
    menuCategory: "crossovers",
    short: "Чанган CS35 MAX",
    name: "Чанган CS35 MAX",
    engine: "1,5Т",
    gearbox: "7DCT",
    power: "280 Н·м / 147 л.с.",
    fuel: "7,8 л / 100 км",
    warranty: "5 лет / 150 000 км",
    price: "2 339 000",
    color: "Белый",
    swatches: [
      ["Белый", "#e7e7e5"],
      ["Графитовый серый", "#52585c"],
      ["Серебристый", "#aeb1b3"],
      ["Чёрный", "#202224"],
    ],
    photos: photos.cs35max,
  },
  {
    key: "cs35-plus",
    category: "Кроссоверы",
    menuCategory: "crossovers",
    short: "Чанган CS35 PLUS",
    name: "Чанган CS35 PLUS",
    engine: "1,4Т",
    gearbox: "7DCT",
    power: "255 Н·м / 150 л.с.",
    fuel: "6,7 л / 100 км",
    warranty: "5 лет / 150 000 км",
    price: "1 899 900",
    color: "Чёрный",
    swatches: [
      ["Чёрный", "#202224"],
      ["Белый", "#e7e7e5"],
      ["Графитовый серый", "#52585c"],
      ["Серебристый", "#aeb1b3"],
    ],
    photos: photos.cs35maxAlt,
  },
  {
    key: "alsvin",
    category: "Седаны",
    menuCategory: "sedans",
    short: "Чанган ALSVIN",
    name: "Чанган ALSVIN",
    engine: "1,5 л",
    gearbox: "5DCT",
    power: "137 Н·м / 98 л.с.",
    fuel: "6,2 л / 100 км",
    warranty: "5 лет / 150 000 км",
    price: "1 795 000",
    color: "Белый",
    swatches: swatchesDefault,
    photos: photos.uniS,
  },
  {
    key: "eado-plus",
    category: "Седаны",
    menuCategory: "sedans",
    short: "Чанган EADO PLUS",
    name: "Чанган EADO PLUS",
    engine: "1,4 л",
    gearbox: "7DCT",
    power: "255 Н·м / 150 л.с.",
    fuel: "5,6 л / 100 км",
    warranty: "5 лет / 150 000 км",
    price: "2 120 000",
    color: "Серебристый",
    swatches: swatchesDefault,
    photos: photos.cs75pro,
  },
  {
    key: "hunter-plus",
    category: "Внедорожники",
    menuCategory: "suv",
    short: "Чанган HUNTER plus",
    name: "Чанган HUNTER plus",
    engine: "2,0Т",
    gearbox: "8АТ",
    power: "390 Н·м / 226 л.с.",
    fuel: "9,9 л / 100 км",
    warranty: "5 лет / 150 000 км",
    price: "3 279 900",
    color: "Графитовый серый",
    swatches: swatchesDefault,
    photos: photos.cs75plusAlt,
  },
];

const formatPowerLine = (text) =>
  text.replace(
    /(\d[\d,]*(?:\s*\/\s*\d[\d,]*)*)\s+(Н·м|л\.с\.)/g,
    '<span class="catalog-lineup__nowrap">$1\u00A0$2</span>',
  );

const formatPower = (text) => {
  if (Array.isArray(text)) {
    return text
      .map((line) => `<span class="catalog-lineup__nowrap">${line}</span>`)
      .join("\n                        ");
  }
  return formatPowerLine(text);
};

const formatFuel = (text) =>
  text.replace(
    /(\d[\d,]*)\s+(л|км)/g,
    '<span class="catalog-lineup__nowrap">$1\u00A0$2</span>',
  );

const cardHtml = (model) => {
  const swatches = model.swatches
    .map(
      ([label, color], index) => `
                    <button
                      class="catalog-lineup__color${index === 0 ? " catalog-lineup__color--active" : ""}"
                      type="button"
                      data-color="${label}"
                      aria-label="${label}"
                      style="--swatch: ${color}"
                    ></button>`,
    )
    .join("");

  const dots = model.photos
    .map(
      (src, index) => `
                    <button
                      class="catalog-lineup__dot${index === 0 ? " catalog-lineup__dot--active" : ""}"
                      type="button"
                      data-photo-src="${src}"
                      aria-label="Фото ${index + 1}"
                    ></button>`,
    )
    .join("");

  return `
            <article
              class="catalog-lineup__card"
              id="model-${model.key}"
              data-catalog-card
              data-catalog-key="${model.key}"
            >
              <header class="catalog-lineup__header">
                <div class="catalog-lineup__heading">
                  <h3>${model.short}</h3>
                </div>
              </header>
              <div class="catalog-lineup__body">
                <div class="catalog-lineup__visual">
                  <div class="catalog-lineup__photo-frame">
                    <img
                      class="catalog-lineup__photo"
                      loading="lazy"
                      decoding="async"
                      src="${model.photos[0]}"
                      alt="${model.name}"
                    />
                    <button
                      class="catalog__gallery-arrow catalog__gallery-arrow--prev catalog-lineup__arrow catalog-lineup__arrow--prev"
                      type="button"
                      aria-label="Предыдущее фото"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m15 5-7 7 7 7" />
                      </svg>
                    </button>
                    <button
                      class="catalog__gallery-arrow catalog__gallery-arrow--next catalog-lineup__arrow catalog-lineup__arrow--next"
                      type="button"
                      aria-label="Следующее фото"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m9 5 7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div
                    class="catalog-lineup__colors"
                    aria-label="Цвет автомобиля"
                  >${swatches}
                  </div>
                  <p class="catalog-lineup__color-name">${model.color}</p>
                  <div
                    class="catalog-lineup__dots"
                    aria-label="Фотографии ${model.name}"
                  >${dots}
                  </div>
                </div>
                <div class="catalog-lineup__info">
                  <dl class="catalog-lineup__specs">
                    <div>
                      <span aria-hidden="true"></span>
                      <dt>Двигатель</dt>
                      <dd>${model.engine}</dd>
                    </div>
                    <div>
                      <span aria-hidden="true"></span>
                      <dt>КПП</dt>
                      <dd>${model.gearbox}</dd>
                    </div>
                    <div>
                      <span aria-hidden="true"></span>
                      <dt>Мощность</dt>
                      <dd${Array.isArray(model.power) ? ' class="catalog-lineup__power-stack"' : ""}>${formatPower(model.power)}</dd>
                    </div>
                    <div>
                      <span aria-hidden="true"></span>
                      <dt>Расход топлива</dt>
                      <dd>${formatFuel(model.fuel)}</dd>
                    </div>
                  </dl>
                  <div class="catalog-lineup__price">
                    <small>Кредит от 0,01% на 8 лет</small>
                    <small class="catalog-lineup__warranty"
                      >Гарантия ${model.warranty}</small
                    >
                    <strong
                      >Цена от ${model.price}
                      <span class="catalog-lineup__currency">₽</span></strong
                    >
                  </div>
                  <div class="catalog-lineup__actions">
                    <button
                      class="catalog__button catalog__button--primary"
                      type="button"
                      data-offer-modal-open
                    >
                      Получить предложение
                    </button>
                    <button
                      class="catalog__button"
                      type="button"
                      data-testdrive-modal-open
                    >
                      Запись на тест-драйв
                    </button>
                  </div>
                </div>
              </div>
            </article>`;
};

const menuCardHtml = (model) => `
                <article class="models-menu__card" data-category="${model.menuCategory}">
                  <a
                    class="models-menu__image"
                    href="#model-${model.key}"
                    data-lineup-key="${model.key}"
                    aria-label="Перейти к ${model.name}"
                  >
                    <img
                      src="${model.photos[0]}"
                      alt="${model.name}"
                    />
                  </a>
                  <h3>${model.short}</h3>
                  <p>от ${model.price} ₽</p>
                </article>`;

const lineup = `
          <div class="catalog-lineup">
${models.map(cardHtml).join("\n")}
          </div>`;

const menuGrid = `
              <div class="models-menu__grid">
${models.map(menuCardHtml).join("\n")}
              </div>`;

const replaceBalancedDiv = (html, startMarker) => {
  const start = html.indexOf(startMarker);
  if (start < 0) throw new Error(`Block not found: ${startMarker}`);

  let depth = 0;
  let pos = start;
  let end = -1;
  while (pos < html.length) {
    const nextOpen = html.indexOf("<div", pos);
    const nextClose = html.indexOf("</div>", pos);
    if (nextClose < 0) break;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth += 1;
      pos = nextOpen + 4;
    } else {
      depth -= 1;
      pos = nextClose + 6;
      if (depth === 0) {
        end = pos;
        break;
      }
    }
  }
  if (end < 0) throw new Error(`Closing tag not found for ${startMarker}`);
  return { start, end };
};

let html = await readFile(indexPath, "utf8");

{
  const { start, end } = replaceBalancedDiv(
    html,
    '<div class="catalog-lineup">',
  );
  html = html.slice(0, start) + lineup.trim() + html.slice(end);
}

{
  const { start, end } = replaceBalancedDiv(
    html,
    '<div class="models-menu__grid">',
  );
  html = html.slice(0, start) + menuGrid.trim() + html.slice(end);
}

await writeFile(indexPath, html, "utf8");
console.log("updated", models.length, "model cards and menu");
