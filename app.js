(() => {
  const carousel = document.querySelector(".clh__hero");

  if (!carousel) return;

  const track = carousel.querySelector(".clh__track");
  const slides = [...carousel.querySelectorAll(".clh__slide")];
  const dotsRoot = carousel.querySelector(".clh__dots");
  const previousButton = carousel.querySelector(".clh__arrow--left");
  const nextButton = carousel.querySelector(".clh__arrow--right");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const delay = 6000;
  const canLoop = slides.length > 1;

  let activeIndex = 0;
  let visualIndex = canLoop ? 1 : 0;
  let timer = null;
  let pointerStartX = null;
  let paused = false;
  let carouselVisible = true;
  let isTransitioning = false;

  if (canLoop) {
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides.at(-1).cloneNode(true);

    [firstClone, lastClone].forEach((clone) => {
      clone.classList.remove("clh__slide--active");
      clone.classList.add("clh__slide--clone");
      clone.setAttribute("aria-hidden", "true");
      clone.inert = true;
    });

    track.prepend(lastClone);
    track.append(firstClone);
  }

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.className = "clh__dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Показать слайд ${index + 1}`);
    dot.addEventListener("click", () => showSlide(index));
    dotsRoot.append(dot);
    return dot;
  });

  const stopAutoplay = () => {
    window.clearTimeout(timer);
    timer = null;
    dots.forEach((dot) => dot.classList.remove("clh__dot--running"));
  };

  const startAutoplay = () => {
    stopAutoplay();

    if (paused || !carouselVisible || reduceMotion.matches || document.hidden)
      return;

    const activeDot = dots[activeIndex];
    void activeDot.offsetWidth;
    activeDot.classList.add("clh__dot--running");
    timer = window.setTimeout(() => showSlide(activeIndex + 1), delay);
  };

  const setTrackPosition = (index, animate = true) => {
    if (animate) {
      track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
      return;
    }

    const previousTransition = track.style.transition;
    track.style.transition = "none";
    track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
    void track.offsetWidth;
    track.style.transition = previousTransition;
  };

  const render = (animate = true) => {
    setTrackPosition(visualIndex, animate);

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("clh__slide--active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.inert = !isActive;
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("clh__dot--active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  function showSlide(index) {
    if (isTransitioning || !slides.length) return;

    if (index >= slides.length) {
      activeIndex = 0;
      visualIndex = canLoop ? slides.length + 1 : 0;
    } else if (index < 0) {
      activeIndex = slides.length - 1;
      visualIndex = canLoop ? 0 : activeIndex;
    } else {
      activeIndex = index;
      visualIndex = canLoop ? index + 1 : index;
    }

    const animate = !reduceMotion.matches;
    isTransitioning = animate;
    render(animate);
    startAutoplay();
  }

  track.addEventListener("transitionend", (event) => {
    if (event.target !== track || event.propertyName !== "transform") return;

    if (canLoop && visualIndex === 0) {
      visualIndex = slides.length;
      setTrackPosition(visualIndex, false);
    } else if (canLoop && visualIndex === slides.length + 1) {
      visualIndex = 1;
      setTrackPosition(visualIndex, false);
    }

    isTransitioning = false;
  });

  previousButton.addEventListener("click", () => showSlide(activeIndex - 1));
  nextButton.addEventListener("click", () => showSlide(activeIndex + 1));

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showSlide(activeIndex - 1);
    if (event.key === "ArrowRight") showSlide(activeIndex + 1);
  });

  carousel.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
  });

  carousel.addEventListener("pointerup", (event) => {
    if (pointerStartX === null) return;

    const distance = event.clientX - pointerStartX;
    pointerStartX = null;

    if (Math.abs(distance) < 45) return;
    showSlide(activeIndex + (distance < 0 ? 1 : -1));
  });

  carousel.addEventListener("pointercancel", () => {
    pointerStartX = null;
  });

  carousel.addEventListener("mouseenter", () => {
    paused = true;
    stopAutoplay();
  });

  carousel.addEventListener("mouseleave", () => {
    paused = false;
    startAutoplay();
  });

  document.addEventListener("visibilitychange", startAutoplay);
  reduceMotion.addEventListener("change", startAutoplay);

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        carouselVisible = entry.isIntersecting;
        if (carouselVisible) startAutoplay();
        else stopAutoplay();
      },
      { threshold: 0.01 },
    );
    visibilityObserver.observe(carousel);
  }

  render(false);
  startAutoplay();
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
    if (event.target.closest("a")) setOpen(false);
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
  const modal = document.querySelector("[data-offer-modal]");
  const openButtons = document.querySelectorAll("[data-offer-modal-open]");

  if (!modal || !openButtons.length) return;

  const dialog = modal.querySelector(".offer-modal__dialog");
  const closeButtons = modal.querySelectorAll("[data-offer-modal-close]");
  const form = modal.querySelector("[data-offer-form]");
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
    if (submit) submit.textContent = "Получить предложение";
    modal.hidden = false;
    document.documentElement.classList.add("offer-modal-open");

    window.requestAnimationFrame(() => {
      modal.classList.add("offer-modal--open");
      dialog.focus();
    });
  };

  const closeModal = () => {
    modal.classList.remove("offer-modal--open");
    document.documentElement.classList.remove("offer-modal-open");

    closeTimer = window.setTimeout(() => {
      modal.hidden = true;
      if (lastFocused) lastFocused.focus();
    }, 220);
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

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.reset();
      if (status) status.hidden = false;
      if (submit) submit.textContent = "Заявка принята";
    });
  }
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

  const cards = [...document.querySelectorAll("[data-catalog-card]")];

  cards.forEach((card) => {
    const photo = card.querySelector(".catalog-lineup__photo");
    const dots = [...card.querySelectorAll(".catalog-lineup__dot")];
    const colors = [...card.querySelectorAll(".catalog-lineup__color")];
    const colorName = card.querySelector(".catalog-lineup__color-name");
    const previousPhoto = card.querySelector(".catalog-lineup__arrow--prev");
    const nextPhoto = card.querySelector(".catalog-lineup__arrow--next");
    const modelButtons = [
      ...card.querySelectorAll(".catalog-lineup__model"),
    ];
    const nextModel = card.querySelector(".catalog-lineup__model-next");
    const modelName = card.querySelector(".catalog-lineup__info h4");
    const specValues = [...card.querySelectorAll(".catalog-lineup__specs dd")];
    const price = card.querySelector(".catalog-lineup__price strong");
    const models = modelGroups[card.dataset.catalogKey] || [];
    let activePhoto = 0;
    let activeModel = 0;
    let photos = dots.map((dot) => dot.dataset.photoSrc).filter(Boolean);
    let pointerStartX = null;

    if (!photo || !dots.length) return;

    const showPhoto = (index) => {
      activePhoto = (index + photos.length) % photos.length;
      const nextDot = dots[activePhoto];
      const nextSource = photos[activePhoto];
      if (!nextSource) return;

      photo.src = nextSource;
      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === activePhoto && dotIndex < photos.length;
        dot.classList.toggle("catalog-lineup__dot--active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });

    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        if (index < photos.length) showPhoto(index);
      });
    });

    const showModel = (index) => {
      if (!models.length) return;
      activeModel = (index + models.length) % models.length;
      const model = models[activeModel];
      photos = model.photos;

      modelButtons.forEach((button, buttonIndex) => {
        const isActive = buttonIndex === activeModel;
        button.classList.toggle("catalog-lineup__model--active", isActive);
        button.setAttribute("aria-selected", String(isActive));
      });

      if (modelName) modelName.textContent = model.name;
      [model.engine, model.gearbox, model.torque, model.power].forEach(
        (value, valueIndex) => {
          if (specValues[valueIndex]) specValues[valueIndex].textContent = value;
        },
      );
      if (price) price.textContent = model.price;
      photo.alt = model.name;

      dots.forEach((dot, dotIndex) => {
        const source = photos[dotIndex];
        dot.hidden = !source;
        if (source) dot.dataset.photoSrc = source;
      });

      activePhoto = 0;
      showPhoto(0);
    };

    modelButtons.forEach((button, index) => {
      button.addEventListener("click", () => showModel(index));
    });

    nextModel?.addEventListener("click", () => showModel(activeModel + 1));

    previousPhoto?.addEventListener("click", () =>
      showPhoto(activePhoto - 1),
    );
    nextPhoto?.addEventListener("click", () => showPhoto(activePhoto + 1));

    colors.forEach((color) => {
      color.addEventListener("click", () => {
        colors.forEach((item) =>
          item.classList.remove("catalog-lineup__color--active"),
        );
        color.classList.add("catalog-lineup__color--active");
        if (colorName) colorName.textContent = color.dataset.color || "";
      });
    });

    photo.addEventListener("pointerdown", (event) => {
      pointerStartX = event.clientX;
      photo.setPointerCapture?.(event.pointerId);
    });

    photo.addEventListener("pointerup", (event) => {
      if (pointerStartX === null) return;
      const distance = event.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(distance) >= 45) {
        showPhoto(activePhoto + (distance < 0 ? 1 : -1));
      }
    });

    photo.addEventListener("pointercancel", () => {
      pointerStartX = null;
    });

    if (models.length) showModel(0);
    else showPhoto(0);
  });
})();
