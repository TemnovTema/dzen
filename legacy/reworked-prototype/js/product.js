(function () {
  const store = window.DzenStore;
  const ui = window.DzenUI;
  const root = document.querySelector("[data-product-view]");
  const relatedRoot = document.querySelector("[data-related-products]");

  if (!store || !root) {
    return;
  }

  function renderNotFound() {
    root.innerHTML = `
      <article class="panel product-not-found">
        <p class="eyebrow">Ошибка маршрута</p>
        <h1>Товар не найден</h1>
        <p>Параметр <code>id</code> не совпал ни с одной позицией каталога.</p>
        <div class="button-row">
          <a class="button button--solid" href="index.html#catalog">Вернуться в каталог</a>
        </div>
      </article>
    `;
  }

  function renderProduct(product) {
    document.title = `${product.name} — Дзен`;

    root.innerHTML = `
      <div class="product-view">
        <div class="product-view__gallery">
          <div class="product-view__stage media-frame">
            <img src="${product.gallery[0]}" alt="${product.name}" data-product-stage>
          </div>
          <div class="product-view__thumbs">
            ${product.gallery
              .map(
                (image, index) => `
                  <button
                    class="thumb-button${index === 0 ? " is-active" : ""}"
                    type="button"
                    data-gallery-image="${image}"
                  >
                    <img src="${image}" alt="${product.name}, изображение ${index + 1}">
                  </button>
                `
              )
              .join("")}
          </div>
        </div>

        <article class="panel product-view__info">
          <div class="product-view__meta">
            <span class="texture-chip">${product.elementLabel}</span>
            <span class="texture-chip">${product.category}</span>
            <span class="texture-chip">${product.availability}</span>
          </div>
          <h1>${product.name}</h1>
          <p class="product-view__lead">${product.description}</p>
          <p class="product-view__copy">${product.longDescription}</p>
          <div class="product-view__price-row">
            <strong class="price">${store.formatPrice(product.price)}</strong>
            <div class="button-row">
              <button class="button button--solid" type="button" data-add-to-cart="${product.id}">
                Добавить в корзину
              </button>
              <a class="button button--ghost" href="cart.html">Открыть корзину</a>
            </div>
          </div>

          <dl class="spec-list">
            ${product.specs
              .map(
                (spec) => `
                  <div class="spec-list__row">
                    <dt>${spec.label}</dt>
                    <dd>${spec.value}</dd>
                  </div>
                `
              )
              .join("")}
          </dl>
        </article>
      </div>

      <div class="product-story-grid">
        <article class="panel">
          <p class="eyebrow">Почему этот объект здесь</p>
          <h2>Роль в системе “Дзен”</h2>
          <p>${product.story}</p>
          <ul class="note-list">
            ${product.ritual.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </article>

        <article class="panel">
          <p class="eyebrow">Материал атмосферы</p>
          <div class="media-frame">
            <img src="${product.storyImage}" alt="${product.name}, визуальный контекст">
          </div>
          <p>${product.shipping}</p>
        </article>
      </div>
    `;

    const stage = root.querySelector("[data-product-stage]");
    const thumbButtons = root.querySelectorAll("[data-gallery-image]");

    thumbButtons.forEach((button) => {
      button.addEventListener("click", () => {
        stage.src = button.dataset.galleryImage;
        thumbButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      });
    });
  }

  function renderRelated(product) {
    if (!relatedRoot) {
      return;
    }

    relatedRoot.innerHTML = store
      .getRelatedProducts(product, 3)
      .map((item) => store.createProductCardMarkup(item, { compact: true }))
      .join("");
  }

  function init() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    const product = productId ? store.getProductById(productId) : store.products[0];

    if (!product) {
      renderNotFound();
      return;
    }

    renderProduct(product);
    renderRelated(product);
    if (ui) {
      ui.updateCartCount();
    }
  }

  init();
})();
