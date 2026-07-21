const ORDER_KEY = "dzenLastOrder";

function getStoredOrder() {
  try {
    const raw = sessionStorage.getItem(ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveOrder(order) {
  try {
    sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
    return true;
  } catch {
    return false;
  }
}

function getCheckoutItems(cart) {
  return cart
    .map((line) => {
      const product = getProductById(line.id);
      if (!product) return null;
      return {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        size: line.size ?? null,
        quantity: Math.max(1, Math.floor(Number(line.quantity) || 1)),
      };
    })
    .filter(Boolean);
}

function renderCheckoutSummary(cart) {
  const summary = document.getElementById("checkout-summary");
  if (!summary) return;

  const items = getCheckoutItems(cart);
  const total = getCartTotal(cart);
  summary.innerHTML = `
    <p class="order-summary__index">Заказ / 02</p>
    <h2 id="checkout-summary-title">Проверка</h2>
    <div class="checkout-summary__items">
      ${items
        .map(
          (item) => `
            <article class="checkout-summary__item">
              <img src="${escapeHtmlCart(item.image)}" alt="">
              <div>
                <h3>${escapeHtmlCart(item.name)}</h3>
                <p>${item.size ? `${escapeHtmlCart(item.size)} · ` : ""}${item.quantity} шт.</p>
              </div>
              <strong>${formatCartPrice(item.price * item.quantity)}</strong>
            </article>`
        )
        .join("")}
    </div>
    <dl class="order-summary__rows">
      <div><dt>Товары</dt><dd>${formatCartPrice(total)}</dd></div>
      <div><dt>Доставка</dt><dd>Подтвердим</dd></div>
      <div class="order-summary__total"><dt>Сумма товаров</dt><dd>${formatCartPrice(total)}</dd></div>
    </dl>
    <p class="order-summary__note">Перед оплатой нужно подтвердить доставку и состав заказа.</p>`;
}

function setFieldError(form, name, message) {
  const input = form.elements[name];
  const error = form.querySelector(`[data-error-for="${name}"]`);
  if (!input || !error) return;

  input.setAttribute("aria-invalid", message ? "true" : "false");
  error.textContent = message;
}

function validateCheckoutForm(form) {
  const values = Object.fromEntries(new FormData(form).entries());
  const required = {
    fullName: "Укажите имя и фамилию.",
    phone: "Укажите телефон.",
    email: "Укажите электронную почту.",
    city: "Укажите город.",
    postalCode: "Укажите индекс.",
    street: "Укажите улицу и дом.",
  };
  let firstInvalid = null;

  Object.keys(required).forEach((name) => {
    const value = String(values[name] || "").trim();
    const message = value ? "" : required[name];
    setFieldError(form, name, message);
    if (message && !firstInvalid) firstInvalid = form.elements[name];
  });

  const email = String(values.email || "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError(form, "email", "Проверьте адрес электронной почты.");
    if (!firstInvalid) firstInvalid = form.elements.email;
  }

  const phoneDigits = String(values.phone || "").replace(/\D/g, "");
  if (phoneDigits && phoneDigits.length < 10) {
    setFieldError(form, "phone", "Введите не менее 10 цифр.");
    if (!firstInvalid) firstInvalid = form.elements.phone;
  }

  const postalCode = String(values.postalCode || "").trim();
  if (postalCode && !/^\d{6}$/.test(postalCode)) {
    setFieldError(form, "postalCode", "Индекс должен состоять из 6 цифр.");
    if (!firstInvalid) firstInvalid = form.elements.postalCode;
  }

  return { values, firstInvalid };
}

function makeOrderNumber() {
  const stamp = String(Date.now()).slice(-8);
  return `DZ-${stamp.slice(0, 4)}-${stamp.slice(4)}`;
}

function buildOrder(formValues, cart) {
  const items = getCheckoutItems(cart);
  return {
    id: makeOrderNumber(),
    createdAt: new Date().toISOString(),
    customer: {
      fullName: String(formValues.fullName).trim(),
      phone: String(formValues.phone).trim(),
      email: String(formValues.email).trim(),
    },
    delivery: {
      city: String(formValues.city).trim(),
      postalCode: String(formValues.postalCode).trim(),
      street: String(formValues.street).trim(),
      unit: String(formValues.unit || "").trim(),
      comment: String(formValues.comment || "").trim(),
    },
    items,
    total: getCartTotal(cart),
  };
}

function formatDeliveryAddress(delivery) {
  const unit = delivery.unit ? `, ${delivery.unit}` : "";
  return `${delivery.postalCode}, ${delivery.city}, ${delivery.street}${unit}`;
}

function renderOrderSuccess(order) {
  const hero = document.getElementById("checkout-hero");
  const flow = document.getElementById("checkout-flow");
  const empty = document.getElementById("checkout-empty");
  const success = document.getElementById("checkout-success");
  const message = document.getElementById("checkout-success-message");
  const details = document.getElementById("checkout-success-details");
  const recommendation = document.getElementById("checkout-recommendation");

  hero.hidden = true;
  flow.hidden = true;
  empty.hidden = true;
  success.hidden = false;
  message.textContent = `${order.customer.fullName}, заявка ${order.id} собрана. Контакты и адрес сохранены в этой сессии.`;
  details.innerHTML = `
    <div><dt>Номер</dt><dd>${escapeHtmlCart(order.id)}</dd></div>
    <div><dt>Адрес</dt><dd>${escapeHtmlCart(formatDeliveryAddress(order.delivery))}</dd></div>
    <div><dt>Сумма товаров</dt><dd>${formatCartPrice(order.total)}</dd></div>
    <div><dt>Следующий шаг</dt><dd>Подтвердить доставку и оплату по телефону</dd></div>`;

  recommendation.hidden = false;
  renderCommerceRecommendation(recommendation, {
    excludedIds: order.items.map((item) => item.id),
    kicker: "Круг продолжается",
    heading: "Следующий предмет",
    headingId: "checkout-recommendation-title",
    description: "Добавьте предмет в новую корзину и продолжите собирать свой набор.",
    onAdd: () => {
      window.location.href = "cart.html";
    },
  });
  updateCartBadges();
  document.getElementById("checkout-success-title").focus();
}

function showCheckoutEmpty() {
  document.getElementById("checkout-flow").hidden = true;
  document.getElementById("checkout-empty").hidden = false;
}

function setupCheckoutForm(form) {
  const formError = document.getElementById("checkout-form-error");
  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      setFieldError(form, input.name, "");
      formError.textContent = "";
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const currentCart = getValidCart();

    if (!currentCart.length) {
      showCheckoutEmpty();
      return;
    }

    const result = validateCheckoutForm(form);
    if (result.firstInvalid) {
      formError.textContent = "Проверьте отмеченные поля.";
      result.firstInvalid.focus();
      return;
    }

    formError.textContent = "";
    const order = buildOrder(result.values, currentCart);
    if (!saveOrder(order)) {
      formError.textContent = "Не удалось сохранить заявку. Проверьте настройки браузера.";
      return;
    }
    saveCart([]);
    history.replaceState(null, "", "#complete");
    renderOrderSuccess(order);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    window.scrollTo({ top: 0, behavior });
  });
}

function initCheckout() {
  const storedOrder = getStoredOrder();
  if (window.location.hash === "#complete" && storedOrder) {
    renderOrderSuccess(storedOrder);
    return;
  }

  const cart = getValidCart();
  if (!cart.length) {
    showCheckoutEmpty();
    return;
  }

  document.getElementById("checkout-flow").hidden = false;
  renderCheckoutSummary(cart);
  setupCheckoutForm(document.getElementById("checkout-form"));
}

document.addEventListener("DOMContentLoaded", initCheckout);
