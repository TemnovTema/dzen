function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getQueryId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderNotFound(root) {
  root.innerHTML = `
<section class="not-found page-shell">
  <p>Товар не найден.</p>
  <p style="margin-top:1rem"><a href="index.html">В каталог</a></p>
</section>`;
  const rel = document.getElementById("related-section");
  if (rel) rel.hidden = true;
}

function getRelatedCardImages(product) {
  const images =
    Array.isArray(product.images) && product.images.length
      ? product.images
      : [product.image];
  const model = images.find((src) => /-worn\./i.test(String(src)));
  const primary = images.find((src) => !/-worn\./i.test(String(src))) || images[0];
  const secondary =
    model || (images.length > 1 && images[1] !== primary ? images[1] : null);
  return { primary, secondary };
}

function renderRelatedCard(product) {
  const title = escapeHtml(product.cardTitle || product.name);
  const fullName = escapeHtml(product.name);
  const price = formatPrice(product.price);
  const href = `product.html?id=${encodeURIComponent(product.id)}`;
  const { primary, secondary } = getRelatedCardImages(product);
  const secondaryMarkup = secondary
    ? `<img class="product-card__image product-card__image--secondary" src="${escapeHtml(secondary)}" alt="${fullName}">`
    : "";

  return `
<article class="product-card">
  <a class="product-card__media" href="${href}">
    <img class="product-card__image product-card__image--primary" src="${escapeHtml(primary)}" alt="${fullName}">
    ${secondaryMarkup}
    <span class="product-card__open" aria-hidden="true">${renderIcon("open", "ui-icon--open")}</span>
  </a>
  <div class="product-card__meta">
    <a class="product-card__title" href="${href}">${title}</a>
    <p class="product-card__price">${price}</p>
  </div>
</article>`;
}

function renderRelated(ids) {
  const wrap = document.getElementById("related-root");
  const section = document.getElementById("related-section");
  if (!wrap || !section) return;

  const cards = (ids || [])
    .map((id) => getProductById(id))
    .filter(Boolean)
    .map((p) => renderRelatedCard(p))
    .join("");

  if (!cards) {
    section.hidden = true;
    return;
  }
  wrap.innerHTML = cards;
  section.hidden = false;
}

function getGalleryImages(product) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }
  return [product.image];
}

function renderSpecs(product) {
  const rows = (product.specs && product.specs.length > 0
    ? product.specs
    : [{ label: "состав", value: product.material }]
  )
    .map(
      (s) => `
    <div class="product-specs__pair">
      <dt>${escapeHtml(s.label)}</dt>
      <dd>${escapeHtml(s.value)}</dd>
    </div>`
    )
    .join("");
  return `<dl class="product-specs">${rows}</dl>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const id = getQueryId();
  const root = document.getElementById("product-root");
  if (!root) return;

  if (!id || typeof getProductById !== "function") {
    renderNotFound(root);
    return;
  }

  const product = getProductById(id);
  if (!product) {
    renderNotFound(root);
    return;
  }

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const galleryImages = hasVariants
    ? [product.image]
    : getGalleryImages(product);
  const needsSize = !hasVariants && product.sizes && product.sizes.length > 0;
  const needsVariant = hasVariants;

  const sizeBlock = needsSize
    ? `
<div class="product-page__field">
  <p class="product-page__label">размер</p>
  <div class="size-picker size-picker--product" id="size-picker" role="radiogroup" aria-label="Размер"></div>
  <p class="field-message" id="size-message" aria-live="polite"></p>
</div>`
    : "";

  const variantBlock = needsVariant
    ? `
<div class="product-page__field">
  <p class="product-page__label">набор</p>
  <div class="size-picker size-picker--product size-picker--variants" id="variant-picker" role="radiogroup" aria-label="Набор"></div>
  <p class="field-message" id="variant-message" aria-live="polite"></p>
</div>`
    : "";

  const qtyBlock = `
<div class="product-page__field">
  <p class="product-page__label">количество</p>
  <div class="quantity-control">
    <button type="button" id="qty-minus" aria-label="Уменьшить">${renderIcon("minus")}</button>
    <input type="number" id="qty-input" min="1" value="1" aria-label="Количество">
    <button type="button" id="qty-plus" aria-label="Увеличить">${renderIcon("plus")}</button>
  </div>
</div>`;

  const showGalleryNav = galleryImages.length > 1;
  const navPrevHidden = showGalleryNav ? "" : " hidden";
  const navNextHidden = showGalleryNav ? "" : " hidden";

  root.innerHTML = `
  <div class="product-page__wrap page-shell">
  <div class="product-page__bar">
    <a href="index.html" class="product-page__back" aria-label="К каталогу">${renderIcon("back", "ui-icon--back")} каталог</a>
  </div>
  <section class="product-page" aria-label="Карточка товара">
    <div class="product-page__media-col">
      <div class="product-page__media" role="region" aria-label="Фотографии товара">
        <img id="product-gallery-img" class="product-page__img" src="${escapeHtml(galleryImages[0])}" alt="${escapeHtml(product.name)}">
        <button type="button" class="product-page__nav product-page__nav--prev" id="gallery-prev" aria-label="Предыдущее фото"${navPrevHidden}>${renderIcon("prev")}</button>
        <button type="button" class="product-page__nav product-page__nav--next" id="gallery-next" aria-label="Следующее фото"${navNextHidden}>${renderIcon("next")}</button>
      </div>
    </div>
    <div class="product-page__info">
      <div class="product-page__lead">
        <h1 class="product-page__title">${escapeHtml(product.name)}</h1>
        <p class="product-page__price">${formatPrice(product.price)}</p>
      </div>
      ${sizeBlock}
      ${variantBlock}
      ${qtyBlock}
      <button type="button" class="btn btn--product-cta" id="add-cart-btn">Добавить в корзину</button>
      <p class="field-message" id="cart-feedback" aria-live="polite"></p>
      <div class="product-page__description">
        <p>${escapeHtml(product.description)}</p>
      </div>
      ${renderSpecs(product)}
    </div>
  </section>
</div>`;

  const qtyInput = document.getElementById("qty-input");
  const feedback = document.getElementById("cart-feedback");
  const sizeMessage = document.getElementById("size-message");
  const variantMessage = document.getElementById("variant-message");
  let selectedSize = null;
  let selectedVariant = null;

  const imgEl = document.getElementById("product-gallery-img");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");
  let galleryIndex = 0;

  function setGalleryIndex(next) {
    galleryIndex = (next + galleryImages.length) % galleryImages.length;
    if (imgEl) {
      imgEl.src = galleryImages[galleryIndex];
    }
  }

  if (showGalleryNav && prevBtn && nextBtn) {
    prevBtn.hidden = false;
    nextBtn.hidden = false;
    prevBtn.addEventListener("click", () => setGalleryIndex(galleryIndex - 1));
    nextBtn.addEventListener("click", () => setGalleryIndex(galleryIndex + 1));
  }

  if (needsSize) {
    const picker = document.getElementById("size-picker");
    product.sizes.forEach((size, i) => {
      const rid = `size-${i}-${size}`;
      picker.insertAdjacentHTML(
        "beforeend",
        `<input type="radio" name="size" id="${rid}" value="${escapeHtml(size)}">
        <label for="${rid}">${escapeHtml(size)}</label>`
      );
    });
    picker.querySelectorAll('input[name="size"]').forEach((input) => {
      input.addEventListener("change", () => {
        selectedSize = input.value;
        sizeMessage.textContent = "";
        sizeMessage.classList.remove("field-message--error");
      });
    });
  }

  if (needsVariant) {
    const picker = document.getElementById("variant-picker");
    product.variants.forEach((variant, i) => {
      const rid = `variant-${i}`;
      picker.insertAdjacentHTML(
        "beforeend",
        `<input type="radio" name="variant" id="${rid}" value="${escapeHtml(variant.id)}">
        <label for="${rid}">${escapeHtml(variant.label || variant.id)}</label>`
      );
    });
    picker.querySelectorAll('input[name="variant"]').forEach((input) => {
      input.addEventListener("change", () => {
        const variant = product.variants.find((v) => v.id === input.value);
        if (!variant) return;
        selectedVariant = variant.id;
        if (imgEl && variant.image) {
          imgEl.src = variant.image;
        }
        if (variantMessage) {
          variantMessage.textContent = "";
          variantMessage.classList.remove("field-message--error");
        }
      });
    });
  }

  document.getElementById("qty-minus").addEventListener("click", () => {
    const v = Math.max(1, (Number(qtyInput.value) || 1) - 1);
    qtyInput.value = String(v);
  });
  document.getElementById("qty-plus").addEventListener("click", () => {
    qtyInput.value = String((Number(qtyInput.value) || 1) + 1);
  });

  document.getElementById("add-cart-btn").addEventListener("click", () => {
    feedback.textContent = "";
    feedback.classList.remove("field-message--error");
    if (needsSize && !selectedSize) {
      if (sizeMessage) {
        sizeMessage.textContent = "Выберите размер перед добавлением в корзину.";
        sizeMessage.classList.add("field-message--error");
      }
      return;
    }
    if (needsVariant && !selectedVariant) {
      if (variantMessage) {
        variantMessage.textContent = "Выберите набор перед добавлением в корзину.";
        variantMessage.classList.add("field-message--error");
      }
      return;
    }
    const qty = Math.max(1, Number(qtyInput.value) || 1);
    const cartKey = needsVariant
      ? selectedVariant
      : needsSize
      ? selectedSize
      : null;
    addToCart(product.id, cartKey, qty);
    updateCartBadges();
    feedback.textContent = "Товар добавлен в корзину.";
  });

  renderRelated(product.relatedIds || []);
});
