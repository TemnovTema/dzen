(function () {
  const STORAGE_KEY = "dzen-cart-v1";

  const products = [
    {
      id: "kimono-dzen",
      name: "Кимоно Дзен",
      price: 4444,
      category: "Одежда",
      element: "water",
      elementLabel: "Вода",
      availability: "Ограниченный дроп",
      image: "assets/images/kimono.png",
      gallery: [
        "assets/images/kimono.png",
        "assets/images/water.real.png",
        "assets/images/pic-1.png"
      ],
      teaser: "Строгое кимоно для практики и повседневного ритуала формы.",
      description: "Форма, в которой движение не спорит с тишиной и дисциплиной.",
      longDescription:
        "Кимоно собрано как базовый предмет дома “Дзен”: плотная ткань, чистый силуэт и минимум декоративного шума. Это не сценический костюм, а рабочая оболочка для практики, чтения, дыхания и повторяемого жеста.",
      story:
        "Этот предмет открывает магазин как флагман: он сразу показывает, что бренд работает не только с образом, но и с ритмом тела. Кимоно держит осанку и собирает внимание, не требуя лишнего жеста.",
      specs: [
        { label: "Состав", value: "100% натуральный хлопок, ручная вышивка" },
        { label: "Крой", value: "Свободный, рассчитан на многослойность и движение" },
        { label: "Уход", value: "Деликатная стирка при 30°" }
      ],
      ritual: [
        "Наденьте кимоно перед практикой, чтением или спокойной работой.",
        "Соберите пространство вокруг: воздух, поверхность, пауза.",
        "Возвращайте вещь на место как часть завершенного действия."
      ],
      shipping: "Отправка за 2-3 дня. Обмен размера возможен в течение 14 дней.",
      storyImage: "assets/images/map.png",
      featured: true,
      relatedIds: ["bokken-do", "book-space", "vinyl-birds"]
    },
    {
      id: "bokken-do",
      name: "Боккен",
      price: 2999,
      category: "Инструменты",
      element: "stone",
      elementLabel: "Камень",
      availability: "Постоянная позиция",
      image: "assets/images/bokken.png",
      gallery: [
        "assets/images/bokken.png",
        "assets/images/katana.png",
        "assets/images/stone.real.png"
      ],
      teaser: "Деревянный меч для тренировок, ритма и точного повторения формы.",
      description: "Простой тренировочный инструмент без лишнего декоративного слоя.",
      longDescription:
        "Боккен продолжает линию предметов с реальным весом. Он нужен не как сувенир, а как спокойный инструмент для отработки траектории, постановки корпуса и внутренней собранности.",
      story:
        "Внутри бренда это самая материальная вещь. Боккен напоминает, что “Дзен” строится не только на образе и атмосфере, но и на сопротивлении материала в руке.",
      specs: [
        { label: "Материал", value: "Прочный дуб" },
        { label: "Поверхность", value: "Шлифованная, матовая, без лакированного блеска" },
        { label: "Назначение", value: "Тренировка траектории, хват, осанка" }
      ],
      ritual: [
        "Работайте короткими сессиями, сохраняя ровный ритм дыхания.",
        "Повторяйте движение до ясности, а не до усталости.",
        "Храните инструмент на виду, как напоминание о практике."
      ],
      shipping: "Отправка за 3-5 дней. Упаковывается в жесткий тубус.",
      storyImage: "assets/images/katana.png",
      relatedIds: ["kimono-dzen", "book-space", "vinyl-birds"]
    },
    {
      id: "book-space",
      name: "Книга «Пространство Дзен»",
      price: 1499,
      category: "Издания",
      element: "fire",
      elementLabel: "Огонь",
      availability: "Небольшой тираж",
      image: "assets/images/mbook.png",
      gallery: [
        "assets/images/mbook.png",
        "assets/images/book.png",
        "assets/images/fire.real.png"
      ],
      teaser: "Печатное издание о философии пространства, ритуале и внимании.",
      description: "Медленный текстовый объект, который поддерживает визуальный и практический слой бренда.",
      longDescription:
        "Книга работает как спокойное продолжение магазина: не объясняет бренд рекламным языком, а раскрывает его через пространство, паузу, японский контекст и бытовой ритуал.",
      story:
        "Печатная часть важна для “Дзен” не меньше предметной. Она удерживает глубину бренда и дает магазину содержательную плотность, которая обычно теряется в слишком утилитарной витрине.",
      specs: [
        { label: "Формат", value: "Твердый переплет, премиальная бумага" },
        { label: "Язык", value: "Русский с японскими вкраплениями" },
        { label: "Назначение", value: "Чтение, коллекция, визуальный объект на полке" }
      ],
      ritual: [
        "Откройте книгу не в спешке, а как отдельное действие.",
        "Читайте короткими блоками, позволяя тексту остаться в воздухе.",
        "Возвращайтесь к разворотам, которые работают как визуальные паузы."
      ],
      shipping: "Отправка за 2-3 дня. Упаковка с защитным картонным уголком.",
      storyImage: "assets/images/book.png",
      relatedIds: ["kimono-dzen", "vinyl-birds", "bokken-do"]
    },
    {
      id: "vinyl-birds",
      name: "Пластинка «Клич перелетных птиц»",
      price: 999,
      category: "Звук",
      element: "air",
      elementLabel: "Воздух",
      availability: "Эксклюзивный тираж",
      image: "assets/images/musplast.png",
      gallery: [
        "assets/images/musplast.png",
        "assets/images/air.real.png",
        "assets/images/pic-5.png"
      ],
      teaser: "Звуковой объект для медитации, паузы и настройки пространства.",
      description: "Винил как небыстрый способ наполнить комнату воздухом, а не шумом.",
      longDescription:
        "Пластинка не стремится быть фоновым музыкальным сервисом. Это отдельный ритуальный объект: поставить, перевернуть, дослушать сторону до конца. Именно поэтому она логично живет внутри бренда “Дзен”.",
      story:
        "Воздух в этой системе так же важен, как материал и форма. Звук задает масштаб комнаты, а не просто сопровождает действие. Отсюда и место винила в каталоге.",
      specs: [
        { label: "Носитель", value: "Винил, ограниченный тираж" },
        { label: "Режим", value: "Домашнее прослушивание, медитация, тихая работа" },
        { label: "Комплект", value: "Пластинка, внутренний конверт, карточка релиза" }
      ],
      ritual: [
        "Ставьте пластинку целиком, без случайного переключения треков.",
        "Оставляйте пространство в комнате свободным от лишнего шума.",
        "Используйте винил как начало или завершение практики."
      ],
      shipping: "Отправка за 2-4 дня в усиленном картонном конверте.",
      storyImage: "assets/images/air.real.png",
      relatedIds: ["book-space", "kimono-dzen", "bokken-do"]
    }
  ];

  function safeReadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(isValidEntry) : [];
    } catch (error) {
      return [];
    }
  }

  function safeWriteCart(cart) {
    const normalized = Array.isArray(cart) ? cart.filter(isValidEntry) : [];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
      return;
    }
    window.dispatchEvent(
      new CustomEvent("dzen:cart-updated", {
        detail: {
          cart: normalized
        }
      })
    );
  }

  function isValidEntry(entry) {
    return (
      entry &&
      typeof entry.id === "string" &&
      Number.isInteger(entry.quantity) &&
      entry.quantity > 0
    );
  }

  function formatPrice(value) {
    return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
  }

  function getProductById(id) {
    return products.find((product) => product.id === id) || null;
  }

  function getCategories() {
    return ["Все"].concat([...new Set(products.map((product) => product.category))]);
  }

  function getCart() {
    return safeReadCart();
  }

  function getCartDetailed() {
    return safeReadCart()
      .map((entry) => {
        const product = getProductById(entry.id);

        if (!product) {
          return null;
        }

        return {
          ...entry,
          product,
          lineTotal: product.price * entry.quantity
        };
      })
      .filter(Boolean);
  }

  function getCartTotals() {
    const items = getCartDetailed();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const delivery = itemCount === 0 ? 0 : subtotal >= 7000 ? 0 : 700;

    return {
      itemCount,
      subtotal,
      delivery,
      total: subtotal + delivery
    };
  }

  function addToCart(id, quantity) {
    const product = getProductById(id);

    if (!product) {
      return;
    }

    const cart = safeReadCart();
    const increment = Math.max(1, Math.round(Number(quantity) || 1));
    const existingItem = cart.find((item) => item.id === id);

    if (existingItem) {
      existingItem.quantity += increment;
    } else {
      cart.push({ id, quantity: increment });
    }

    safeWriteCart(cart);
  }

  function setCartQuantity(id, quantity) {
    const cart = safeReadCart();
    const nextQuantity = Math.max(0, Math.round(Number(quantity) || 0));
    const existingItem = cart.find((item) => item.id === id);

    if (!existingItem) {
      return;
    }

    if (nextQuantity === 0) {
      safeWriteCart(cart.filter((item) => item.id !== id));
      return;
    }

    existingItem.quantity = nextQuantity;
    safeWriteCart(cart);
  }

  function changeCartQuantity(id, delta) {
    const cart = safeReadCart();
    const existingItem = cart.find((item) => item.id === id);

    if (!existingItem) {
      return;
    }

    setCartQuantity(id, existingItem.quantity + delta);
  }

  function removeFromCart(id) {
    const cart = safeReadCart().filter((item) => item.id !== id);
    safeWriteCart(cart);
  }

  function clearCart() {
    safeWriteCart([]);
  }

  function getRelatedProducts(product, limit) {
    const fallback = products.filter((item) => item.id !== product.id);

    if (!product.relatedIds || !product.relatedIds.length) {
      return fallback.slice(0, limit || 3);
    }

    const mapped = product.relatedIds
      .map((id) => getProductById(id))
      .filter(Boolean);

    return mapped.slice(0, limit || mapped.length);
  }

  function getRecommendations(excludedIds, limit) {
    const hidden = new Set(excludedIds || []);
    return products.filter((product) => !hidden.has(product.id)).slice(0, limit || products.length);
  }

  function createProductCardMarkup(product, options) {
    const settings = {
      compact: false,
      ...options
    };

    const cardClass = settings.compact ? "product-card product-card--compact" : "product-card";

    return `
      <article class="${cardClass} product-card--${product.element}">
        <a class="product-card__media media-frame" href="product.html?id=${product.id}">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <span class="texture-chip product-card__chip">${product.elementLabel}</span>
        </a>
        <div class="product-card__body">
          <div class="product-card__meta">
            <span>${product.category}</span>
            <span>${product.availability}</span>
          </div>
          <h3 class="product-card__title">
            <a href="product.html?id=${product.id}">${product.name}</a>
          </h3>
          <p class="product-card__text">${product.teaser}</p>
          <div class="product-card__footer">
            <strong class="price">${formatPrice(product.price)}</strong>
            <div class="product-card__actions">
              <a class="button button--ghost" href="product.html?id=${product.id}">Подробнее</a>
              <button class="button button--solid" type="button" data-add-to-cart="${product.id}">
                В корзину
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  window.DzenStore = {
    products,
    formatPrice,
    getProductById,
    getCategories,
    getCart,
    getCartDetailed,
    getCartTotals,
    addToCart,
    setCartQuantity,
    changeCartQuantity,
    removeFromCart,
    clearCart,
    getRelatedProducts,
    getRecommendations,
    createProductCardMarkup
  };
})();
