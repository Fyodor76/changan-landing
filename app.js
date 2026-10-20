(() => {
  const carousel = document.querySelector(".clh__hero");
  if (!carousel || typeof window.Swiper !== "function") return;

  const slides = [...carousel.querySelectorAll(".clh__slide")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (slides.length < 2) return;

  const syncSlides = (swiper) => {
    slides.forEach((slide, index) => {
      const isActive = index === swiper.realIndex;
      slide.classList.toggle("clh__slide--active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.inert = !isActive;
    });
  };

  const restartProgress = (swiper) => {
    const bullets = swiper.pagination?.bullets || [];
    bullets.forEach((bullet) => bullet.classList.remove("clh__dot--running"));

    if (reduceMotion.matches || !swiper.autoplay?.running) return;

    const activeBullet = bullets[swiper.realIndex];
    if (!activeBullet) return;
    void activeBullet.offsetWidth;
    activeBullet.classList.add("clh__dot--running");
  };

  const swiper = new window.Swiper(carousel, {
    slidesPerView: 1,
    speed: reduceMotion.matches ? 0 : 800,
    loop: true,
    grabCursor: true,
    watchOverflow: true,
    resistanceRatio: 0.65,
    threshold: 8,
    longSwipesRatio: 0.25,
    followFinger: true,
    allowTouchMove: true,
    touchStartPreventDefault: false,
    noSwipingSelector: "a, button, input, label, .clh__quick",
    autoplay: reduceMotion.matches
      ? false
      : {
          delay: 6000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        },
    navigation: {
      nextEl: carousel.querySelector(".clh__arrow--right"),
      prevEl: carousel.querySelector(".clh__arrow--left"),
    },
    pagination: {
      el: carousel.querySelector(".clh__dots"),
      clickable: true,
      bulletClass: "clh__dot",
      bulletActiveClass: "clh__dot--active",
      renderBullet(index, className) {
        return `<button type="button" class="${className}" aria-label="Показать слайд ${index + 1}"></button>`;
      },
    },
    a11y: {
      enabled: true,
      prevSlideMessage: "Предыдущий слайд",
      nextSlideMessage: "Следующий слайд",
      paginationBulletMessage: "Перейти к слайду {{index}}",
    },
    on: {
      init(instance) {
        syncSlides(instance);
        restartProgress(instance);
      },
      slideChange(instance) {
        syncSlides(instance);
      },
      slideChangeTransitionStart(instance) {
        restartProgress(instance);
      },
      autoplayStart(instance) {
        restartProgress(instance);
      },
    },
  });

  document.addEventListener("visibilitychange", () => {
    if (!swiper.autoplay) return;
    if (document.hidden) swiper.autoplay.stop();
    else swiper.autoplay.start();
  });

  reduceMotion.addEventListener("change", () => {
    swiper.params.speed = reduceMotion.matches ? 0 : 650;
    if (!swiper.autoplay) return;
    if (reduceMotion.matches) swiper.autoplay.stop();
    else swiper.autoplay.start();
  });
})();

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const groups = [
    {
      root: document.querySelector(".special-offers"),
      target: document.querySelector(".special-offers__grid"),
      items: document.querySelectorAll(".special-offers__card"),
    },
    {
      root: document.querySelector(".why-us"),
      target: document.querySelector(".why-us__board"),
      items: document.querySelectorAll(".why-us__feature, .why-us__item"),
    },
    {
      root: document.querySelector(".why-changan"),
      target: document.querySelector(".why-changan__grid"),
      items: document.querySelectorAll(".why-changan__card"),
    },
  ].filter(({ root, target, items }) => root && target && items.length);

  if (!groups.length || reduceMotion.matches) return;

  const groupByTarget = new Map(
    groups.map((group) => [group.target, group]),
  );

  groups.forEach(({ root, items }) => {
    root.classList.add("section-reveal--ready");
    items.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${index * 75}ms`);
    });
  });

  if (!("IntersectionObserver" in window)) {
    groups.forEach(({ root }) => root.classList.add("section-reveal--visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;

        const group = groupByTarget.get(entry.target);
        if (!group) return;

        group.root.classList.add("section-reveal--visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.5,
      rootMargin: `-${document.querySelector(".clh__header")?.offsetHeight || 0}px 0px 0px`,
    },
  );

  groups.forEach(({ target }) => observer.observe(target));
})();

(() => {
  const header = document.querySelector(".clh__header");
  const toggle = document.querySelector(".clh__menu-toggle");
  const nav = document.querySelector("#primary-navigation");

  if (!header || !toggle || !nav) return;

  const modelsToggle = header.querySelector(".clh__models-toggle");
  const modelsMenu = header.querySelector(".models-menu");
  let lockedScrollY = 0;
  let pageLocked = false;

  const closeModels = () => {
    if (modelsToggle) modelsToggle.setAttribute("aria-expanded", "false");
    if (modelsMenu) modelsMenu.hidden = true;
  };

  const setPageLock = (shouldLock) => {
    if (shouldLock === pageLocked) return;

    if (shouldLock) {
      lockedScrollY = window.scrollY;
      document.documentElement.style.setProperty(
        "--clh-menu-scroll-y",
        `${lockedScrollY}px`,
      );
      document.documentElement.classList.add("clh-mobile-menu-open");
      pageLocked = true;
      return;
    }

    document.documentElement.classList.remove("clh-mobile-menu-open");
    document.documentElement.style.removeProperty("--clh-menu-scroll-y");
    pageLocked = false;
    window.scrollTo(0, lockedScrollY);
  };

  const setOpen = (isOpen) => {
    header.classList.toggle("clh__header--menu-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
    setPageLock(isOpen && window.innerWidth <= 768);

    if (!isOpen) closeModels();
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", (event) => {
    if (
      event.target.closest(
        "a, [data-offer-modal-open], [data-testdrive-modal-open], [data-callback-modal-open]",
      )
    ) {
      setOpen(false);
    }
  });

  const scrollToHashTarget = (href) => {
    if (!href || !href.startsWith("#") || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  modelsMenu?.addEventListener("click", (event) => {
    if (event.target.closest("[data-menu-category]")) return;

    const link = event.target.closest(
      ".models-menu__image, .models-menu__all-row",
    );
    if (!link) return;

    const href = link.getAttribute("href");
    const wasLocked = pageLocked;
    setOpen(false);
    if (wasLocked) scrollToHashTarget(href);
  });

  document.addEventListener("click", (event) => {
    if (
      toggle.getAttribute("aria-expanded") === "true" &&
      !header.contains(event.target)
    ) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || toggle.getAttribute("aria-expanded") !== "true") {
      return;
    }

    setOpen(false);
    toggle.focus();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) setOpen(false);
  });
})();

(() => {
  const toggle = document.querySelector(".clh__models-toggle");
  const menu = document.querySelector(".models-menu");

  if (!toggle || !menu) return;

  const categories = [
    ...menu.querySelectorAll("[data-menu-category]"),
  ];
  const cards = [...menu.querySelectorAll(".models-menu__card")];
  const grid = menu.querySelector(".models-menu__grid");
  const emptyState = menu.querySelector(".models-menu__empty");

  const setOpen = (isOpen) => {
    toggle.setAttribute("aria-expanded", String(isOpen));
    menu.hidden = !isOpen;
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  categories.forEach((category) => {
    category.addEventListener("click", (event) => {
      event.preventDefault();

      const selectedCategory = category.dataset.menuCategory;
      let visibleCount = 0;

      categories.forEach((item) => {
        item.classList.toggle(
          "models-menu__category--active",
          item === category,
        );
      });

      cards.forEach((card) => {
        const isVisible = card.dataset.category === selectedCategory;
        card.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });

      if (grid) grid.hidden = visibleCount === 0;
      if (emptyState) emptyState.hidden = visibleCount !== 0;
    });
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("[data-menu-category]")) return;
    if (event.target.closest(".models-menu__image, .models-menu__all-row")) {
      setOpen(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (menu.hidden || event.target === toggle || toggle.contains(event.target)) return;
    if (!menu.contains(event.target)) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || menu.hidden) return;
    setOpen(false);
    toggle.focus();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768) setOpen(false);
  });
})();

(() => {
  const bindLeadModal = ({
    modalSelector,
    openSelector,
    closeSelector,
    formSelector,
    submitLabel,
    successLabel,
  }) => {
    const modal = document.querySelector(modalSelector);
    const openButtons = document.querySelectorAll(openSelector);
    if (!modal || !openButtons.length) return null;

    const dialog = modal.querySelector(".offer-modal__dialog");
    const closeButtons = modal.querySelectorAll(closeSelector);
    const form = modal.querySelector(formSelector);
    const status = modal.querySelector(".offer-modal__status");
    const submit = modal.querySelector(".offer-modal__submit");
    let lastFocused = null;
    let closeTimer = null;

    const getFocusable = () => [
      ...modal.querySelectorAll(
        "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]",
      ),
    ];

    const openModal = (trigger) => {
      window.clearTimeout(closeTimer);
      lastFocused = trigger;
      if (status) status.hidden = true;
      if (submit) {
        submit.innerHTML = `${submitLabel} <span aria-hidden="true">→</span>`;
      }
      modal.hidden = false;
      document.documentElement.classList.add("offer-modal-open");

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          modal.classList.add("offer-modal--open");
          dialog?.focus();
        });
      });
    };

    const closeModal = () => {
      modal.classList.remove("offer-modal--open");
      document.documentElement.classList.remove("offer-modal-open");

      closeTimer = window.setTimeout(() => {
        modal.hidden = true;
        if (lastFocused) lastFocused.focus();
      }, 360);
    };

    openButtons.forEach((button) => {
      button.addEventListener("click", () => openModal(button));
    });

    closeButtons.forEach((button) => {
      button.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
      if (modal.hidden) return;

      if (event.key === "Escape") {
        closeModal();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      form.reset();
      if (status) status.hidden = false;
      if (submit) submit.textContent = successLabel;
    });

    return { modal, closeModal };
  };

  bindLeadModal({
    modalSelector: "[data-offer-modal]",
    openSelector: "[data-offer-modal-open]",
    closeSelector: "[data-offer-modal-close]",
    formSelector: "[data-offer-form]",
    submitLabel: "Получить предложение",
    successLabel: "Заявка принята",
  });

  bindLeadModal({
    modalSelector: "[data-testdrive-modal]",
    openSelector: "[data-testdrive-modal-open]",
    closeSelector: "[data-testdrive-modal-close]",
    formSelector: "[data-testdrive-form]",
    submitLabel: "Записаться на тест-драйв",
    successLabel: "Запись принята",
  });

  bindLeadModal({
    modalSelector: "[data-callback-modal]",
    openSelector: "[data-callback-modal-open]",
    closeSelector: "[data-callback-modal-close]",
    formSelector: "[data-callback-form]",
    submitLabel: "Жду звонка",
    successLabel: "Заявка принята",
  });
})();

(() => {
  const map = document.querySelector(".contacts__map");
  if (!map) return;

  const disableMap = () => map.classList.remove("contacts__map--interactive");

  map.addEventListener("click", (event) => {
    if (event.target.closest(".contacts__card")) return;
    map.classList.add("contacts__map--interactive");
  });

  map.addEventListener("mouseleave", disableMap);
  document.addEventListener("click", (event) => {
    if (!map.contains(event.target)) disableMap();
  });
})();

(() => {
  const reviews = document.querySelector(".reviews");
  if (!reviews) return;

  const track = reviews.querySelector(".reviews__track");
  const cards = [...reviews.querySelectorAll(".review-card")];
  const previous = reviews.querySelector(".reviews__arrow--prev");
  const next = reviews.querySelector(".reviews__arrow--next");
  let activeIndex = 0;

  const visibleCards = () => {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  };

  const update = () => {
    const visible = visibleCards();
    const lastIndex = Math.max(0, cards.length - visible);
    activeIndex = Math.min(activeIndex, lastIndex);
    track.style.transform = `translateX(-${activeIndex * (100 / visible)}%)`;
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === lastIndex;
  };

  previous.addEventListener("click", () => {
    activeIndex = Math.max(0, activeIndex - 1);
    update();
  });

  next.addEventListener("click", () => {
    activeIndex = Math.min(cards.length - visibleCards(), activeIndex + 1);
    update();
  });

  window.addEventListener("resize", update);
  update();
})();

(() => {
  const catalog = document.querySelector(".catalog--legacy");

  if (!catalog) return;

  const models = [
    {
      category: "crossovers",
      tab: "CS75 PRO",
      name: "CHANGAN CS75 PRO",
      engine: "1.5T л.",
      gearbox: "7DCT",
      torque: "300 Н·м",
      power: "188 л.с.",
      price: "2 500 000 ₽",
      photos: [
        "./assets/model-cs75pro.jpg",
        "./assets/model-cs75pro-2.jpg",
        "./assets/model-cs75pro-3.jpg",
        "./assets/881c3fa9-a324-4830-bace-687386982736.png",
      ],
    },
    {
      category: "crossovers",
      tab: "UNI-S",
      name: "CHANGAN UNI-S 4×4",
      engine: "1.5T л.",
      gearbox: "7DCT",
      torque: "280 Н·м",
      power: "181 л.с.",
      price: "2 640 000 ₽",
      photos: [
        "./assets/model-uni-s.jpg",
        "./assets/model-uni-s-2.jpg",
        "./assets/model-uni-s-3.jpg",
        "./assets/slide-4-desktop.png",
      ],
    },
    {
      category: "crossovers",
      tab: "CS35 MAX",
      name: "CHANGAN CS35 MAX",
      engine: "1.5T л.",
      gearbox: "7DCT",
      torque: "280 Н·м",
      power: "147 л.с.",
      price: "2 215 000 ₽",
      photos: [
        "./assets/model-cs35max.jpg",
        "./assets/model-cs35max-2.jpg",
        "./assets/model-cs35max-3.jpg",
      ],
    },
  ];

  const modelTabs = [...catalog.querySelectorAll(".catalog__tab")];
  const categoryButtons = [
    ...catalog.querySelectorAll(".catalog__categories button"),
  ];
  const stage = catalog.querySelector(".catalog__stage");
  const modelsNavigation = catalog.querySelector(".catalog__models-nav");
  const tabsRoot = catalog.querySelector(".catalog__tabs");
  const nextModel = catalog.querySelector(".catalog__model-next");
  const emptyState = catalog.querySelector(".catalog__empty");
  const photo = catalog.querySelector(".catalog__photo");
  const thumbnailsRoot = catalog.querySelector(
    ".catalog__thumbnails, .catalog__photo-dots",
  );
  const modelName = catalog.querySelector(".catalog__model-name");
  const engine = catalog.querySelector(".catalog__engine");
  const gearbox = catalog.querySelector(".catalog__gearbox");
  const torque = catalog.querySelector(".catalog__torque");
  const power = catalog.querySelector(".catalog__power");
  const price = catalog.querySelector(".catalog__price");
  const previousPhoto = catalog.querySelector(".catalog__gallery-arrow--prev");
  const nextPhoto = catalog.querySelector(".catalog__gallery-arrow--next");
  const colorButtons = [...catalog.querySelectorAll(".catalog__color")];
  const colorName = catalog.querySelector(".catalog__color-name");

  let activeModel = 0;
  let activePhoto = 0;
  let activeCategory = "crossovers";
  let pointerStartX = null;

  models
    .flatMap((model) => model.photos)
    .forEach((source) => {
      const image = new Image();
      image.src = source;
    });

  const renderPhotoDots = () => {
    if (!thumbnailsRoot) return;

    thumbnailsRoot.replaceChildren();

    models[activeModel].photos.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "catalog__photo-dot";
      dot.classList.toggle(
        "catalog__photo-dot--active",
        index === activePhoto,
      );
      dot.setAttribute("aria-label", `Показать фотографию ${index + 1}`);
      dot.addEventListener("click", () => showPhoto(index));
      thumbnailsRoot.append(dot);
    });
  };

  const updatePhoto = () => {
    const model = models[activeModel];
    photo.classList.add("catalog__photo--changing");
    photo.src = model.photos[activePhoto];
    photo.alt = `${model.name}, фотография ${activePhoto + 1}`;

    const reveal = () => photo.classList.remove("catalog__photo--changing");
    if (photo.complete) requestAnimationFrame(reveal);
    else photo.addEventListener("load", reveal, { once: true });

    if (thumbnailsRoot) {
      [...thumbnailsRoot.children].forEach((dot, index) => {
        dot.classList.toggle(
          "catalog__photo-dot--active",
          index === activePhoto,
        );
      });
    }
  };

  function showPhoto(index) {
    const photos = models[activeModel].photos;
    activePhoto = (index + photos.length) % photos.length;
    updatePhoto();
  }

  const showModel = (index) => {
    activeModel = (index + models.length) % models.length;
    activePhoto = 0;
    const model = models[activeModel];

    modelTabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === activeModel;
      tab.classList.toggle("catalog__tab--active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    modelName.textContent = model.name;
    engine.textContent = model.engine;
    gearbox.textContent = model.gearbox;
    torque.textContent = model.torque;
    power.textContent = model.power;
    price.textContent = `Цена от ${model.price}`;

    renderPhotoDots();
    updatePhoto();
  };

  const visibleModelIndexes = () =>
    models.reduce((indexes, model, index) => {
      if (model.category === activeCategory) indexes.push(index);
      return indexes;
    }, []);

  const showAdjacentModel = (direction) => {
    const indexes = visibleModelIndexes();
    if (indexes.length < 2) return;
    const currentPosition = Math.max(0, indexes.indexOf(activeModel));
    const nextPosition =
      (currentPosition + direction + indexes.length) % indexes.length;
    const nextIndex = indexes[nextPosition];
    showModel(nextIndex);
    modelTabs[nextIndex].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const updateModelArrow = () => {
    if (!nextModel || !tabsRoot || modelsNavigation?.hidden) return;
    const modelCount = visibleModelIndexes().length;
    const hasOverflow = tabsRoot.scrollWidth > tabsRoot.clientWidth + 1;
    nextModel.hidden = modelCount < 3 && !hasOverflow;
  };

  modelTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => showModel(index));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      showAdjacentModel(direction);
      modelTabs[activeModel].focus();
    });
  });

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((item) =>
        item.classList.remove("catalog__category--active"),
      );
      button.classList.add("catalog__category--active");

      activeCategory = button.dataset.category;
      const indexes = visibleModelIndexes();

      modelTabs.forEach((tab, index) => {
        tab.hidden = !indexes.includes(index);
      });

      const isEmpty = indexes.length === 0;
      if (modelsNavigation) modelsNavigation.hidden = isEmpty;
      if (stage) stage.hidden = isEmpty;
      if (emptyState) emptyState.hidden = !isEmpty;

      if (!isEmpty) {
        showModel(indexes[0]);
        requestAnimationFrame(updateModelArrow);
      }
    });
  });

  if (nextModel) {
    nextModel.addEventListener("click", () => showAdjacentModel(1));
  }

  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      colorButtons.forEach((item) =>
        item.classList.remove("catalog__color--active"),
      );
      button.classList.add("catalog__color--active");
      colorName.textContent = button.dataset.color;
    });
  });

  previousPhoto.addEventListener("click", () => showPhoto(activePhoto - 1));
  nextPhoto.addEventListener("click", () => showPhoto(activePhoto + 1));

  photo.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
  });

  photo.addEventListener("pointerup", (event) => {
    if (pointerStartX === null) return;
    const distance = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(distance) >= 45)
      showPhoto(activePhoto + (distance < 0 ? 1 : -1));
  });

  photo.addEventListener("pointercancel", () => {
    pointerStartX = null;
  });

  showModel(0);
  requestAnimationFrame(updateModelArrow);
  window.addEventListener("resize", updateModelArrow);

  if (window.location.hash === "#model-lineup") {
    requestAnimationFrame(() => catalog.scrollIntoView({ block: "start" }));
  }
})();

(() => {
  if (typeof window.Swiper !== "function") return;

  const modelGroups = {
    crossovers: [
      {
        name: "CHANGAN CS75 PRO",
        engine: "1.5T л.",
        gearbox: "7DCT",
        torque: "300 Н·м",
        power: "188 л.с.",
        price: "Цена от 2 500 000 ₽",
        photos: [
          "./assets/881c3fa9-a324-4830-bace-687386982736.png",
          "./assets/model-cs75pro.jpg",
          "./assets/model-cs75pro-2.jpg",
          "./assets/model-cs75pro-3.jpg",
        ],
      },
      {
        name: "CHANGAN UNI-S 4×4",
        engine: "1.5T л.",
        gearbox: "7DCT",
        torque: "280 Н·м",
        power: "181 л.с.",
        price: "Цена от 2 640 000 ₽",
        photos: [
          "./assets/model-uni-s.jpg",
          "./assets/model-uni-s-2.jpg",
          "./assets/model-uni-s-3.jpg",
        ],
      },
      {
        name: "CHANGAN CS35 MAX",
        engine: "1.5T л.",
        gearbox: "7DCT",
        torque: "280 Н·м",
        power: "147 л.с.",
        price: "Цена от 2 215 000 ₽",
        photos: [
          "./assets/model-cs35max.jpg",
          "./assets/model-cs35max-2.jpg",
          "./assets/model-cs35max-3.jpg",
        ],
      },
    ],
  };

  const arrowMarkup = `
    <button
      class="catalog__gallery-arrow catalog__gallery-arrow--prev catalog-lineup__arrow catalog-lineup__arrow--prev"
      type="button"
      aria-label="Предыдущее фото"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
    </button>
    <button
      class="catalog__gallery-arrow catalog__gallery-arrow--next catalog-lineup__arrow catalog-lineup__arrow--next"
      type="button"
      aria-label="Следующее фото"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
    </button>
  `;

  const ensureGallery = (frame) => {
    let gallery = frame.closest(".catalog-lineup__gallery");
    if (gallery) return gallery;

    gallery = document.createElement("div");
    gallery.className = "catalog-lineup__gallery";
    frame.parentNode?.insertBefore(gallery, frame);
    gallery.appendChild(frame);
    return gallery;
  };

  const cards = [...document.querySelectorAll("[data-catalog-card]")];

  cards.forEach((card) => {
    const frame = card.querySelector(".catalog-lineup__photo-frame");
    const dotsRoot = card.querySelector(".catalog-lineup__dots");
    const colors = [...card.querySelectorAll(".catalog-lineup__color")];
    const colorName = card.querySelector(".catalog-lineup__color-name");
    const modelButtons = [
      ...card.querySelectorAll(".catalog-lineup__model"),
    ];
    const modelsScroller = card.querySelector(".catalog-lineup__models");
    const nextModel = card.querySelector(".catalog-lineup__model-next");
    const modelName = card.querySelector(".catalog-lineup__info h4");
    const specValues = [...card.querySelectorAll(".catalog-lineup__specs dd")];
    const price = card.querySelector(".catalog-lineup__price strong");
    const models = modelGroups[card.dataset.catalogKey] || [];
    const initialPhotos = [
      ...card.querySelectorAll(".catalog-lineup__dot[data-photo-src]"),
    ]
      .map((dot) => dot.dataset.photoSrc)
      .filter(Boolean);

    if (!frame || !dotsRoot) return;

    const gallery = ensureGallery(frame);

    let activeModel = 0;
    let photoSwiper = null;
    let photos = models[0]?.photos?.slice() || initialPhotos;

    const scrollActiveModelIntoView = () => {
      const activeButton = modelButtons[activeModel];
      if (!activeButton || !modelsScroller) return;

      const scrollerRect = modelsScroller.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      const pad = 12;
      let delta = 0;

      if (buttonRect.left < scrollerRect.left + pad) {
        delta = buttonRect.left - scrollerRect.left - pad;
      } else if (buttonRect.right > scrollerRect.right - pad) {
        delta = buttonRect.right - scrollerRect.right + pad;
      }

      if (delta) {
        modelsScroller.scrollBy({ left: delta, behavior: "smooth" });
      }
    };

    const mountPhotoSwiper = (photoList, altText) => {
      if (!photoList.length) return;

      photoSwiper?.destroy(true, true);
      photoSwiper = null;

      const slides = photoList
        .map(
          (src) => `
            <div class="swiper-slide">
              <img
                class="catalog-lineup__photo"
                src="${src}"
                alt="${altText}"
                loading="lazy"
                decoding="async"
                draggable="false"
              />
            </div>
          `,
        )
        .join("");

      frame.classList.add("swiper");
      frame.innerHTML = `<div class="swiper-wrapper">${slides}</div>`;
      gallery
        .querySelectorAll(".catalog-lineup__arrow")
        .forEach((arrow) => arrow.remove());
      gallery.insertAdjacentHTML("beforeend", arrowMarkup);
      dotsRoot.innerHTML = "";

      const nextEl = gallery.querySelector(".catalog-lineup__arrow--next");
      const prevEl = gallery.querySelector(".catalog-lineup__arrow--prev");

      photoSwiper = new window.Swiper(frame, {
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 750,
        loop: photoList.length > 1,
        grabCursor: true,
        watchOverflow: true,
        threshold: 8,
        longSwipesRatio: 0.3,
        followFinger: true,
        allowTouchMove: true,
        touchStartPreventDefault: false,
        resistanceRatio: 0.75,
        navigation: {
          nextEl,
          prevEl,
        },
        pagination: {
          el: dotsRoot,
          clickable: true,
          bulletClass: "catalog-lineup__dot",
          bulletActiveClass: "catalog-lineup__dot--active",
          renderBullet(index, className) {
            return `<button type="button" class="${className}" aria-label="Фото ${index + 1}"></button>`;
          },
        },
      });

      nextEl?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        photoSwiper?.slideNext();
      });
      prevEl?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        photoSwiper?.slidePrev();
      });

      photoSwiper.on("click", (_swiper, event) => {
        const photo = event.target?.closest?.(".catalog-lineup__photo");
        if (!photo || !frame.contains(photo)) return;
        const src = photo.currentSrc || photo.src;
        if (!src) return;
        window.dispatchEvent(
          new CustomEvent("catalog-lineup:open-photo", {
            detail: {
              src,
              alt: photo.alt || modelName?.textContent || "Changan",
            },
          }),
        );
      });
    };

    const showModel = (index) => {
      if (!models.length) return;
      activeModel = (index + models.length) % models.length;
      const model = models[activeModel];
      photos = model.photos.slice();

      modelButtons.forEach((button, buttonIndex) => {
        const isActive = buttonIndex === activeModel;
        button.classList.toggle("catalog-lineup__model--active", isActive);
        button.setAttribute("aria-selected", String(isActive));
      });
      scrollActiveModelIntoView();

      if (modelName) modelName.textContent = model.name;
      [model.engine, model.gearbox, model.torque, model.power].forEach(
        (value, valueIndex) => {
          if (specValues[valueIndex]) specValues[valueIndex].textContent = value;
        },
      );
      if (price) {
        price.innerHTML = model.price.replace(
          /₽/g,
          '<span class="catalog-lineup__currency">₽</span>',
        );
      }

      mountPhotoSwiper(photos, model.name);
    };

    modelButtons.forEach((button, index) => {
      button.addEventListener("click", () => showModel(index));
    });

    nextModel?.addEventListener("click", () => showModel(activeModel + 1));

    colors.forEach((color) => {
      color.addEventListener("click", () => {
        colors.forEach((item) =>
          item.classList.remove("catalog-lineup__color--active"),
        );
        color.classList.add("catalog-lineup__color--active");
        if (colorName) colorName.textContent = color.dataset.color || "";
      });
    });

    if (models.length) showModel(0);
    else {
      const alt =
        card.querySelector(".catalog-lineup__photo")?.alt ||
        modelName?.textContent ||
        "Changan";
      mountPhotoSwiper(photos, alt);
    }
  });
})();

(() => {
  const banner = document.querySelector("[data-cookie-banner]");
  if (!banner) return;

  const storageKey = "changan-cookie-consent";
  const acceptButton = banner.querySelector("[data-cookie-accept]");
  const declineButton = banner.querySelector("[data-cookie-decline]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let hideTimer = null;

  const hasChoice = () => {
    try {
      return Boolean(window.localStorage.getItem(storageKey));
    } catch {
      return false;
    }
  };

  const saveChoice = (value) => {
    try {
      window.localStorage.setItem(storageKey, value);
    } catch {
      /* ignore quota / private mode */
    }
  };

  const showBanner = () => {
    banner.hidden = false;
    banner.classList.remove("cookie-banner--leaving");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        banner.classList.add("cookie-banner--visible");
      });
    });
  };

  const hideBanner = (choice) => {
    saveChoice(choice);
    banner.classList.remove("cookie-banner--visible");
    banner.classList.add("cookie-banner--leaving");

    const delay = reduceMotion.matches ? 0 : 380;
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      banner.hidden = true;
      banner.classList.remove("cookie-banner--leaving");
    }, delay);
  };

  if (!hasChoice()) {
    window.setTimeout(showBanner, reduceMotion.matches ? 0 : 600);
  }

  acceptButton?.addEventListener("click", () => hideBanner("accepted"));
  declineButton?.addEventListener("click", () => hideBanner("declined"));
})();

(() => {
  const lightbox = document.querySelector("[data-photo-lightbox]");
  if (!lightbox) return;

  const stage = lightbox.querySelector("[data-photo-lightbox-stage]");
  const image = lightbox.querySelector("[data-photo-lightbox-image]");
  const hint = lightbox.querySelector("[data-photo-lightbox-hint]");
  const closeButtons = lightbox.querySelectorAll("[data-photo-lightbox-close]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let originX = 0;
  let originY = 0;
  let closeTimer = null;
  let moved = false;

  const applyTransform = () => {
    image.style.setProperty("--lx", `${offsetX}px`);
    image.style.setProperty("--ly", `${offsetY}px`);
    image.style.setProperty("--lz", String(scale));
  };

  const setZoomed = (isZoomed) => {
    scale = isZoomed ? 2.2 : 1;
    if (!isZoomed) {
      offsetX = 0;
      offsetY = 0;
    }
    lightbox.classList.toggle("photo-lightbox--zoomed", isZoomed);
    if (hint) {
      hint.textContent = isZoomed
        ? "Нажмите, чтобы уменьшить"
        : "Нажмите, чтобы увеличить";
    }
    applyTransform();
  };

  const openLightbox = ({ src, alt }) => {
    window.clearTimeout(closeTimer);
    image.src = src;
    image.alt = alt || "";
    setZoomed(false);
    lightbox.hidden = false;
    document.documentElement.classList.add("photo-lightbox-open");
    window.requestAnimationFrame(() => {
      lightbox.classList.add("photo-lightbox--open");
    });
  };

  const closeLightbox = () => {
    lightbox.classList.remove("photo-lightbox--open", "photo-lightbox--zoomed");
    document.documentElement.classList.remove("photo-lightbox-open");
    setZoomed(false);
    closeTimer = window.setTimeout(
      () => {
        lightbox.hidden = true;
        image.removeAttribute("src");
      },
      reduceMotion.matches ? 0 : 240,
    );
  };

  window.addEventListener("catalog-lineup:open-photo", (event) => {
    openLightbox(event.detail || {});
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      closeLightbox();
    });
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  stage?.addEventListener("click", (event) => {
    if (moved) return;
    event.stopPropagation();
    setZoomed(scale <= 1);
  });

  stage?.addEventListener("pointerdown", (event) => {
    if (scale <= 1) return;
    dragging = true;
    moved = false;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    originX = offsetX;
    originY = offsetY;
    lightbox.classList.add("photo-lightbox--dragging");
    stage.setPointerCapture?.(event.pointerId);
  });

  stage?.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - dragStartX;
    const dy = event.clientY - dragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
    offsetX = originX + dx;
    offsetY = originY + dy;
    applyTransform();
  });

  const endDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    lightbox.classList.remove("photo-lightbox--dragging");
    try {
      stage?.releasePointerCapture?.(event.pointerId);
    } catch {
      /* ignore */
    }
  };

  stage?.addEventListener("pointerup", endDrag);
  stage?.addEventListener("pointercancel", endDrag);

  stage?.addEventListener("wheel", (event) => {
    event.preventDefault();
    if (event.deltaY < 0) setZoomed(true);
    else setZoomed(false);
  }, { passive: false });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
  });
})();

(() => {
  const button = document.querySelector("[data-scroll-top]");
  if (!button) return;

  const toggle = () => {
    button.classList.toggle("scroll-top--visible", window.scrollY > 480);
  };

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
})();
