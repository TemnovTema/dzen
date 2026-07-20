(function () {
  const store = window.DzenStore;
  const ui = window.DzenUI;
  const root = document.querySelector("[data-cart-root]");
  const recommendationsRoot = document.querySelector("[data-cart-recommendations]");

  if (!store || !root) {
    return;
  }

  function renderRecommendations() {
    if (!recommendationsRoot) {
      return;
    }

    const excludedIds = store.getCartDetailed().map((item) => item.product.id);
    const recommendations = store.getRecommendations(excludedIds, 3);

    recommendationsRoot.innerHTML = recommendations
      .map((product) => store.createProductCardMarkup(product, { compact: true }))
      .join("");
  }

  function renderEmptyState() {
    root.innerHTML = `
      <article class="panel empty-state">
        <p class="eyebrow">Пока пусто</p>
        <h2>Корзина еще не собрана</h2>
        <p>
          Вернитесь в каталог и выберите предметы, которые подходят вашему
          ритму практики.
        </p>
        <div class="button-row">
          <a class="button button--solid" href="index.html#catalog">Перейти в каталог</a>
        </div>
      </article>
    `;
  }

  function renderFilledCart(items, totals) {
    root.innerHTML = `
      <div class="cart-layout">
        <section class="panel cart-list" aria-label="Список товаров в корзине">
          <p class="eyebrow">Состав заказа</p>
          <div class="cart-items">
            ${items
              .map(
                (item) => `
                  <article class="cart-item">
                    <a class="cart-item__media media-frame" href="product.html?id=${item.product.id}">
                      <img src="${item.product.image}" alt="${item.product.name}">
                    </a>
                    <div class="cart-item__body">
                      <div class="cart-item__meta">
                        <span>${item.product.category}</span>
                        <span>${item.product.elementLabel}</span>
                      </div>
                      <h2><a href="product.html?id=${item.product.id}">${item.product.name}</a></h2>
                      <p>${item.product.teaser}</p>
                      <div class="cart-item__controls">
                        <div class="qty-control" aria-label="Количество товара">
                          <button type="button" data-cart-action="decrease" data-product-id="${item.product.id}">−</button>
                          <span>${item.quantity}</span>
                          <button type="button" data-cart-action="increase" data-product-id="${item.product.id}">+</button>
                        </div>
                        <button class="text-button" type="button" data-cart-action="remove" data-product-id="${item.product.id}">
                          Удалить
                        </button>
                      </div>
                    </div>
                    <div class="cart-item__line">
                      <strong class="price">${store.formatPrice(item.lineTotal)}</strong>
                      <span>${store.formatPrice(item.product.price)} за единицу</span>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>

        <aside class="panel summary-card">
          <p class="eyebrow">Итог</p>
          <div class="summary-row">
            <span>Позиции</span>
            <span>${totals.itemCount}</span>
          </div>
          <div class="summary-row">
            <span>Подытог</span>
            <span>${store.formatPrice(totals.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>Доставка</span>
            <span>${totals.delivery === 0 ? "бесплатно" : store.formatPrice(totals.delivery)}</span>
          </div>
          <div class="summary-row summary-row--total">
            <span>К оплате</span>
            <span>${store.formatPrice(totals.total)}</span>
          </div>
          <button class="button button--solid button--wide" type="button" data-cart-checkout>
            Подтвердить заказ
          </button>
          <a class="button button--ghost button--wide" href="index.html#catalog">Продолжить выбор</a>
          <button class="text-button" type="button" data-cart-clear>Очистить корзину</button>
          <p class="summary-note">
            Это статический прототип: товары и суммы уже работают, но онлайн-оплата
            пока не подключена.
          </p>
        </aside>
      </div>
    `;
  }

  function render() {
    const items = store.getCartDetailed();
    const totals = store.getCartTotals();

    if (!items.length) {
      renderEmptyState();
      renderRecommendations();
      if (ui) {
        ui.updateCartCount();
      }
      return;
    }

    renderFilledCart(items, totals);
    renderRecommendations();
    if (ui) {
      ui.updateCartCount();
    }
  }

  root.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-cart-action]");

    if (actionButton) {
      const productId = actionButton.dataset.productId;
      const action = actionButton.dataset.cartAction;

      if (action === "increase") {
        store.changeCartQuantity(productId, 1);
      }

      if (action === "decrease") {
        store.changeCartQuantity(productId, -1);
      }

      if (action === "remove") {
        store.removeFromCart(productId);
      }

      render();
      return;
    }

    const clearButton = event.target.closest("[data-cart-clear]");

    if (clearButton) {
      store.clearCart();
      render();
      return;
    }

    const checkoutButton = event.target.closest("[data-cart-checkout]");

    if (checkoutButton && ui) {
      ui.showToast("Прототип корзины готов. Следующий шаг — форма и оплата.");
    }
  });

  window.addEventListener("dzen:cart-updated", render);

  render();
})();
