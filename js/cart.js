const CART_KEY = "dzenCart";

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
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function getCartItemCount() {
  return getCart().reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
}

function updateCartBadges() {
  const n = getCartItemCount();
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = String(n);
  });
}

function addToCart(productId, size, quantity) {
  const qty = Math.max(1, Number(quantity) || 1);
  const cart = getCart();
  const keySize = size == null || size === "" ? null : size;
  const idx = cart.findIndex(
    (line) => line.id === productId && (line.size ?? null) === keySize
  );
  if (idx >= 0) {
    cart[idx].quantity = (Number(cart[idx].quantity) || 0) + qty;
  } else {
    cart.push({ id: productId, size: keySize, quantity: qty });
  }
  saveCart(cart);
  updateCartBadges();
}

function setLineQuantity(productId, size, quantity) {
  const keySize = size == null || size === "" ? null : size;
  const cart = getCart();
  const idx = cart.findIndex(
    (line) => line.id === productId && (line.size ?? null) === keySize
  );
  if (idx < 0) return;
  const q = Number(quantity);
  if (!q || q < 1) {
    cart.splice(idx, 1);
  } else {
    cart[idx].quantity = q;
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

function escapeHtmlCart(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCartPage() {
  const tbody = document.getElementById("cart-body");
  const empty = document.getElementById("cart-empty");
  const tableWrap = document.getElementById("cart-table-wrap");
  const summary = document.getElementById("cart-summary");

  if (!tbody || !empty || !tableWrap || !summary) return;

  const raw = getCart();
  const cart = typeof getProductById === "function"
    ? raw.filter((line) => getProductById(line.id))
    : raw;
  if (cart.length !== raw.length) {
    saveCart(cart);
  }

  if (!cart.length) {
    empty.hidden = false;
    tableWrap.hidden = true;
    summary.hidden = true;
    return;
  }

  empty.hidden = true;
  tableWrap.hidden = false;
  summary.hidden = false;

  let total = 0;
  tbody.innerHTML = cart
    .map((line) => {
      const p = typeof getProductById === "function" ? getProductById(line.id) : null;
      if (!p) return "";
      const qty = Math.max(1, Number(line.quantity) || 1);
      const lineTotal = p.price * qty;
      total += lineTotal;
      const sizeLabel = line.size ? escapeHtmlCart(line.size) : "—";
      const name = escapeHtmlCart(p.name);
      const sizeKey = line.size == null ? "" : line.size;
      return `<tr data-id="${escapeHtmlCart(line.id)}" data-size="${escapeHtmlCart(sizeKey)}">
  <td><div class="cart-item__thumb"><img src="${escapeHtmlCart(p.image)}" alt=""></div></td>
  <td><a href="product.html?id=${encodeURIComponent(line.id)}">${name}</a></td>
  <td>${sizeLabel}</td>
  <td>
    <div class="quantity-control">
      <button type="button" class="cart-qty-minus" aria-label="Меньше">−</button>
      <input type="number" class="cart-qty-input" min="1" value="${qty}" aria-label="Количество">
      <button type="button" class="cart-qty-plus" aria-label="Больше">+</button>
    </div>
  </td>
  <td>${typeof formatPrice === "function" ? formatPrice(p.price) : p.price}</td>
  <td>${typeof formatPrice === "function" ? formatPrice(lineTotal) : lineTotal}</td>
  <td><button type="button" class="btn cart-remove">Удалить</button></td>
</tr>`;
    })
    .join("");

  summary.innerHTML = `
<p><strong>Итого</strong></p>
<p class="product-price">${typeof formatPrice === "function" ? formatPrice(total) : total}</p>
<p class="product-description" style="font-size:0.8125rem">Доставка рассчитывается отдельно.</p>`;

  tbody.querySelectorAll("tr").forEach((row) => {
    const pid = row.getAttribute("data-id");
    const sizeAttr = row.getAttribute("data-size");
    const size = !sizeAttr || sizeAttr === "" ? null : sizeAttr;

    row.querySelector(".cart-qty-minus").addEventListener("click", () => {
      const input = row.querySelector(".cart-qty-input");
      const v = Math.max(1, (Number(input.value) || 1) - 1);
      input.value = String(v);
      setLineQuantity(pid, size, v);
      renderCartPage();
    });
    row.querySelector(".cart-qty-plus").addEventListener("click", () => {
      const input = row.querySelector(".cart-qty-input");
      const v = (Number(input.value) || 1) + 1;
      input.value = String(v);
      setLineQuantity(pid, size, v);
      renderCartPage();
    });
    row.querySelector(".cart-qty-input").addEventListener("change", (e) => {
      const v = Number(e.target.value);
      if (!v || v < 1) {
        removeLine(pid, size);
      } else {
        setLineQuantity(pid, size, v);
      }
      renderCartPage();
    });
    row.querySelector(".cart-remove").addEventListener("click", () => {
      removeLine(pid, size);
      renderCartPage();
    });
  });

  updateCartBadges();
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadges();
  renderCartPage();
});
