const CART_KEY = "dzenCart";
const DZEN_ICONS = new Set([
  "back",
  "forward",
  "minus",
  "next",
  "open",
  "plus",
  "prev",
]);

function renderIcon(name, className = "") {
  if (!DZEN_ICONS.has(name)) return "";
  const classes = ["ui-icon", className].filter(Boolean).join(" ");
  return `<svg class="${classes}" aria-hidden="true" focusable="false"><use href="assets/icons.svg#icon-${name}"></use></svg>`;
}

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // Storage can be unavailable in strict privacy modes.
  }
}

function getCartItemCount() {
  return getCart().reduce(
    (sum, line) =>
      sum + Math.max(1, Math.floor(Number(line.quantity) || 1)),
    0
  );
}

function updateCartBadges() {
  const count = getCartItemCount();
  document.querySelectorAll(".cart-count").forEach((element) => {
    element.textContent = String(count);
  });
}

function addToCart(productId, size, quantity) {
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const cart = getCart();
  const keySize = size == null || size === "" ? null : size;
  const index = cart.findIndex(
    (line) => line.id === productId && (line.size ?? null) === keySize
  );

  if (index >= 0) {
    cart[index].quantity = (Number(cart[index].quantity) || 0) + qty;
  } else {
    cart.push({ id: productId, size: keySize, quantity: qty });
  }

  saveCart(cart);
  updateCartBadges();
}

function setLineQuantity(productId, size, quantity) {
  const keySize = size == null || size === "" ? null : size;
  const cart = getCart();
  const index = cart.findIndex(
    (line) => line.id === productId && (line.size ?? null) === keySize
  );
  if (index < 0) return;

  const qty = Math.floor(Number(quantity));
  if (!qty || qty < 1) {
    cart.splice(index, 1);
  } else {
    cart[index].quantity = qty;
  }

  saveCart(cart);
  updateCartBadges();
}

function removeLine(productId, size) {
  const keySize = size == null || size === "" ? null : size;
  const cart = getCart().filter(
    (line) => !(line.id === productId && (line.size ?? null) === keySize)
  );
  saveCart(cart);
  updateCartBadges();
}

function escapeHtmlCart(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getValidCart() {
  const raw = getCart();
  if (typeof getProductById !== "function") return raw;

  let changed = false;
  const valid = raw.reduce((items, line) => {
    if (!getProductById(line.id)) {
      changed = true;
      return items;
    }

    const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1));
    const size = line.size == null || line.size === "" ? null : line.size;
    if (
      quantity !== line.quantity ||
      size !== (line.size ?? null) ||
      !Object.prototype.hasOwnProperty.call(line, "size")
    ) {
      changed = true;
    }
    items.push({ id: line.id, size, quantity });
    return items;
  }, []);
  if (changed) saveCart(valid);
  return valid;
}

function getCartTotal(cart) {
  if (typeof getProductById !== "function") return 0;
  return cart.reduce((sum, line) => {
    const product = getProductById(line.id);
    const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1));
    return product ? sum + product.price * quantity : sum;
  }, 0);
}

function formatCartItemCount(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  let word = "предметов";
  if (mod10 === 1 && mod100 !== 11) word = "предмет";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    word = "предмета";
  }
  return `${count} ${word}`;
}

function formatCartPrice(value) {
  return typeof formatPrice === "function" ? formatPrice(value) : `${value} ₽`;
}

function getRecommendationProduct(excludedIds) {
  if (typeof PRODUCTS === "undefined") return null;
  const excluded = new Set(excludedIds || []);
  const canQuickAdd = (product) =>
    !excluded.has(product.id) &&
    (!Array.isArray(product.sizes) || product.sizes.length === 0) &&
    (!Array.isArray(product.variants) || product.variants.length === 0);

  const preferredIds = [
    "shopper-dzen",
    "crossbody-madfrenzy-dzen",
    "cap-blue-moon-dzen",
    "kniga-prostranstvo",
    "vinil-ptitsy",
  ];
  const preferred = preferredIds
    .map((id) => getProductById(id))
    .find((product) => product && canQuickAdd(product));

  return preferred || PRODUCTS.find(canQuickAdd) || null;
}

function renderCommerceRecommendation(container, options) {
  if (!container) return;

  const product = getRecommendationProduct(options.excludedIds || []);
  if (!product) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  const productName = escapeHtmlCart(product.name);
  const productUrl = `product.html?id=${encodeURIComponent(product.id)}`;

  container.hidden = false;
  container.innerHTML = `
    <div class="flow-recommendation__copy">
      <p class="commerce-kicker">${escapeHtmlCart(options.kicker)}</p>
      <h2 id="${escapeHtmlCart(options.headingId)}">${escapeHtmlCart(options.heading)}</h2>
      <p>${escapeHtmlCart(options.description)}</p>
    </div>
    <a class="flow-recommendation__media" href="${productUrl}">
      <img src="${escapeHtmlCart(product.image)}" alt="${productName}" loading="lazy">
      <span class="flow-recommendation__open" aria-hidden="true">${renderIcon("open", "ui-icon--open")}</span>
    </a>
    <div class="flow-recommendation__product">
      <div>
        <a href="${productUrl}">${productName}</a>
        <p>${formatCartPrice(product.price)}</p>
      </div>
      <button class="commerce-button commerce-button--compact" type="button" data-recommendation-add>
        Добавить ${renderIcon("plus")}
      </button>
    </div>`;

  const button = container.querySelector("[data-recommendation-add]");
  button.addEventListener("click", () => {
    addToCart(product.id, null, 1);
    if (typeof options.onAdd === "function") options.onAdd(product);
  });
}

function getLineOptionLabel(product, line) {
  if (!line.size) return "";
  if (Array.isArray(product.sizes) && product.sizes.length) {
    return `<span>Размер</span><strong>${escapeHtmlCart(line.size)}</strong>`;
  }
  return `<span>Вариант</span><strong>${escapeHtmlCart(line.size)}</strong>`;
}

function renderCartLine(line) {
  const product = getProductById(line.id);
  if (!product) return "";

  const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1));
  const lineTotal = product.price * quantity;
  const sizeKey = line.size == null ? "" : line.size;
  const option = getLineOptionLabel(product, line);
  const productUrl = `product.html?id=${encodeURIComponent(line.id)}`;

  return `
    <article class="cart-line" data-id="${escapeHtmlCart(line.id)}" data-size="${escapeHtmlCart(sizeKey)}">
      <a class="cart-line__media" href="${productUrl}">
        <img src="${escapeHtmlCart(product.image)}" alt="${escapeHtmlCart(product.name)}">
      </a>
      <div class="cart-line__content">
        <div class="cart-line__heading">
          <div>
            <a href="${productUrl}">${escapeHtmlCart(product.name)}</a>
            <p>${formatCartPrice(product.price)} / шт.</p>
          </div>
          <button class="cart-line__remove" type="button">Удалить</button>
        </div>
        ${option ? `<p class="cart-line__option">${option}</p>` : ""}
        <div class="cart-line__footer">
          <div class="quantity-control" aria-label="Количество товара">
            <button type="button" class="cart-qty-minus" aria-label="Уменьшить количество">${renderIcon("minus")}</button>
            <input type="number" class="cart-qty-input" min="1" value="${quantity}" aria-label="Количество">
            <button type="button" class="cart-qty-plus" aria-label="Увеличить количество">${renderIcon("plus")}</button>
          </div>
          <p class="cart-line__total"><span>Сумма</span><strong>${formatCartPrice(lineTotal)}</strong></p>
        </div>
      </div>
    </article>`;
}

function bindCartLineEvents(container) {
  container.querySelectorAll(".cart-line").forEach((row) => {
    const productId = row.getAttribute("data-id");
    const sizeValue = row.getAttribute("data-size");
    const size = sizeValue ? sizeValue : null;
    const input = row.querySelector(".cart-qty-input");

    row.querySelector(".cart-qty-minus").addEventListener("click", () => {
      const quantity = Math.max(1, (Number(input.value) || 1) - 1);
      setLineQuantity(productId, size, quantity);
      renderCartPage();
    });

    row.querySelector(".cart-qty-plus").addEventListener("click", () => {
      const quantity = (Number(input.value) || 1) + 1;
      setLineQuantity(productId, size, quantity);
      renderCartPage();
    });

    input.addEventListener("change", () => {
      const quantity = Number(input.value);
      if (!quantity || quantity < 1) {
        removeLine(productId, size);
      } else {
        setLineQuantity(productId, size, quantity);
      }
      renderCartPage();
    });

    row.querySelector(".cart-line__remove").addEventListener("click", () => {
      removeLine(productId, size);
      renderCartPage();
    });
  });
}

function renderCartSummary(summary, cart) {
  const total = getCartTotal(cart);
  summary.innerHTML = `
    <p class="order-summary__index">Итог / 01</p>
    <h2 id="cart-summary-title">Ваш заказ</h2>
    <dl class="order-summary__rows">
      <div><dt>Товары</dt><dd>${formatCartPrice(total)}</dd></div>
      <div><dt>Доставка</dt><dd>После адреса</dd></div>
      <div class="order-summary__total"><dt>Итого сейчас</dt><dd>${formatCartPrice(total)}</dd></div>
    </dl>
    <p class="order-summary__note">Состав заказа можно изменить до отправки заявки.</p>
    <a class="commerce-button commerce-button--primary" href="checkout.html">Перейти к оформлению ${renderIcon("forward", "ui-icon--forward")}</a>
    <a class="order-summary__continue" href="index.html">Продолжить покупки</a>`;
}

function renderCartRecommendation(cart) {
  const recommendation = document.getElementById("cart-recommendation");
  renderCommerceRecommendation(recommendation, {
    excludedIds: cart.map((line) => line.id),
    kicker: cart.length ? "Ещё один штрих" : "Начать с малого",
    heading: cart.length ? "Дополнить заказ" : "Первый предмет",
    headingId: "cart-recommendation-title",
    description: cart.length
      ? "Предмет без размера можно добавить сразу, не прерывая оформление."
      : "Один самостоятельный предмет, чтобы запустить новый круг.",
    onAdd: () => renderCartPage(),
  });
}

function renderCartPage() {
  const body = document.getElementById("cart-body");
  const empty = document.getElementById("cart-empty");
  const content = document.getElementById("cart-content");
  const count = document.getElementById("cart-lines-count");
  const summary = document.getElementById("cart-summary");

  if (!body || !empty || !content || !count || !summary) return;

  const cart = getValidCart();
  renderCartRecommendation(cart);

  if (!cart.length) {
    empty.hidden = false;
    content.hidden = true;
    body.innerHTML = "";
    return;
  }

  empty.hidden = true;
  content.hidden = false;
  const itemCount = cart.reduce(
    (sum, line) => sum + Math.max(1, Math.floor(Number(line.quantity) || 1)),
    0
  );
  count.textContent = formatCartItemCount(itemCount);
  body.innerHTML = cart.map(renderCartLine).join("");

  renderCartSummary(summary, cart);
  bindCartLineEvents(body);
  updateCartBadges();
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadges();
  renderCartPage();
});
