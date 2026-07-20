(function () {
  const store = window.DzenStore;

  if (!store) {
    return;
  }

  let toastTimeoutId = 0;

  function updateCartCount() {
    const { itemCount } = store.getCartTotals();
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
      node.textContent = itemCount;
    });
  }

  function updateCurrentYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll("[data-current-year]").forEach((node) => {
      node.textContent = year;
    });
  }

  function getOrCreateToast() {
    let toast = document.querySelector("[data-toast]");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("data-toast", "");
      document.body.appendChild(toast);
    }

    return toast;
  }

  function showToast(message) {
    const toast = getOrCreateToast();
    toast.textContent = message;
    toast.classList.add("is-visible");

    window.clearTimeout(toastTimeoutId);
    toastTimeoutId = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  function renderFeaturedProduct() {
    const container = document.querySelector("[data-featured-product]");

    if (!container) {
      return;
    }

    const product = store.products.find((item) => item.featured) || store.products[0];

    container.innerHTML = `
      <article class="featured-product">
        <p class="eyebrow">Флагман</p>
        <a class="featured-product__media media-frame" href="product.html?id=${product.id}">
          <img src="${product.image}" alt="${product.name}">
        </a>
        <div class="featured-product__body">
          <div class="featured-product__meta">
            <span>${product.category}</span>
            <span>${product.availability}</span>
          </div>
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          <div class="button-row">
            <a class="button button--ghost" href="product.html?id=${product.id}">Открыть товар</a>
            <button class="button button--solid" type="button" data-add-to-cart="${product.id}">
              Добавить в корзину
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderCatalog(activeCategory) {
    const grid = document.querySelector("[data-product-grid]");

    if (!grid) {
      return;
    }

    const filteredProducts =
      activeCategory === "Все"
        ? store.products
        : store.products.filter((product) => product.category === activeCategory);

    grid.innerHTML = filteredProducts
      .map((product) => store.createProductCardMarkup(product))
      .join("");
  }

  function renderFilterBar() {
    const filterBar = document.querySelector("[data-filter-bar]");

    if (!filterBar) {
      return;
    }

    const categories = store.getCategories();
    let activeCategory = "Все";

    filterBar.innerHTML = categories
      .map(
        (category) => `
          <button
            class="filter-pill${category === activeCategory ? " is-active" : ""}"
            type="button"
            data-filter="${category}"
          >
            ${category}
          </button>
        `
      )
      .join("");

    renderCatalog(activeCategory);

    filterBar.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");

      if (!button) {
        return;
      }

      activeCategory = button.dataset.filter;

      filterBar.querySelectorAll("[data-filter]").forEach((node) => {
        node.classList.toggle("is-active", node === button);
      });

      renderCatalog(activeCategory);
    });
  }

  function handleGlobalClick(event) {
    const addButton = event.target.closest("[data-add-to-cart]");

    if (!addButton) {
      return;
    }

    const productId = addButton.dataset.addToCart;
    const product = store.getProductById(productId);

    if (!product) {
      return;
    }

    store.addToCart(productId, 1);
    showToast(`Добавлено: ${product.name}`);
    updateCartCount();
  }

  function init() {
    updateCartCount();
    updateCurrentYear();
    renderFeaturedProduct();
    renderFilterBar();
    document.addEventListener("click", handleGlobalClick);
    window.addEventListener("dzen:cart-updated", updateCartCount);
  }

  init();

  window.DzenUI = {
    showToast,
    updateCartCount
  };
})();
