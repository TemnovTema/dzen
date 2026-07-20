function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

let activeCategoryFilter = "all";
const selectedSizes = new Set();
const selectedColors = new Set();
let activeSortMode = "default";
let isFilterPanelOpen = false;

const CATEGORY_FILTERS = new Set(["Одежда", "Аксессуары", "Печатное", "Другое"]);

function setupCategoryFromUrl() {
  const requestedCategory = new URLSearchParams(window.location.search).get("category");
  if (requestedCategory && CATEGORY_FILTERS.has(requestedCategory)) {
    activeCategoryFilter = requestedCategory;
  }
}

const COLOR_KEYWORDS = {
  Чёрный: ["чёрн", "черн", "тёмн", "темн", "ноч", "black"],
  Белый: ["бел", "white"],
  Синий: ["син", "blue"],
  Красный: ["красн", "red"],
};

function isTshirt(product) {
  const title = String(product.cardTitle || product.name || "").toLowerCase();
  return title.startsWith("футболка");
}

function getColorHaystack(product) {
  return `${product.name || ""} ${product.cardTitle || ""} ${
    product.description || ""
  }`.toLowerCase();
}

function productHasColor(product, color) {
  const text = getColorHaystack(product);
  const keywords = COLOR_KEYWORDS[color] || [];
  return keywords.some((k) => text.includes(k));
}

function getFilteredProducts() {
  if (typeof PRODUCTS === "undefined") return [];

  let list = PRODUCTS.slice();

  if (activeCategoryFilter !== "all") {
    list = list.filter(
      (product) => product.category === activeCategoryFilter
    );
  }

  if (selectedSizes.size > 0) {
    list = list.filter(
      (p) =>
        Array.isArray(p.sizes) &&
        p.sizes.length > 0 &&
        p.sizes.some((s) => selectedSizes.has(s))
    );
  }

  if (selectedColors.size > 0) {
    list = list.filter((p) =>
      Array.from(selectedColors).some((c) => productHasColor(p, c))
    );
  }

  return list;
}

function sortProducts(list) {
  const copy = list.slice();
  switch (activeSortMode) {
    case "price-asc":
      copy.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      copy.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      copy.sort((a, b) => a.name.localeCompare(b.name, "ru"));
      break;
    default:
      copy.sort((a, b) => Number(isTshirt(b)) - Number(isTshirt(a)));
      break;
  }
  return copy;
}

const CATALOG_SECTIONS = [
  { id: "tshirts", title: "Футболки", match: isTshirt },
  {
    id: "hoodies",
    title: "Худи",
    match: (p) =>
      String(p.cardTitle || p.name || "").toLowerCase().startsWith("худи"),
  },
  {
    id: "sweatshirts",
    title: "Свитшоты",
    match: (p) => {
      const t = String(p.cardTitle || p.name || "").toLowerCase();
      return t.startsWith("свитшот") || t.startsWith("свитер");
    },
  },
  {
    id: "accessories",
    title: "Аксессуары",
    match: (p) => p.category === "Аксессуары",
  },
  {
    id: "rest",
    title: "Другое",
    match: () => true,
  },
];

function groupProductsBySections(list) {
  const groups = CATALOG_SECTIONS.map((s) => ({ ...s, items: [] }));
  list.forEach((product) => {
    for (const group of groups) {
      if (group.match(product)) {
        group.items.push(product);
        break;
      }
    }
  });
  return groups.filter((g) => g.items.length > 0);
}

function renderProductCard(p, index = 0) {
  const title = escapeHtml(p.cardTitle || p.name);
  const fullName = escapeHtml(p.name);
  const price =
    typeof formatPrice === "function" ? formatPrice(p.price) : `${p.price} ₽`;
  const href = `product.html?id=${encodeURIComponent(p.id)}`;
  const primaryImage =
    Array.isArray(p.images) && p.images.length ? p.images[0] : p.image;
  const secondaryImage =
    Array.isArray(p.images) && p.images.length > 1 ? p.images[1] : null;
  const secondaryMarkup = secondaryImage
    ? `<img class="product-card__image product-card__image--secondary" src="${escapeHtml(secondaryImage)}" alt="${fullName}">`
    : "";
  const cardNumber = String(index + 1).padStart(2, "0");
  return `
<article class="product-card">
  <a class="product-card__media" href="${href}">
    <img class="product-card__image product-card__image--primary" src="${escapeHtml(primaryImage)}" alt="${fullName}">
    ${secondaryMarkup}
  </a>

  <div class="product-card__meta">
    <a class="product-card__title" href="${href}">${title}</a>
    <p class="product-card__price">${price}</p>
    <span class="product-card__number" aria-hidden="true">${cardNumber}</span>
  </div>
</article>`;
}

function activeFilterCount() {
  let count = 0;
  if (activeCategoryFilter !== "all") count += 1;
  count += selectedSizes.size;
  count += selectedColors.size;
  if (activeSortMode !== "default") count += 1;
  return count;
}

function renderCategoryHeader(title, count, sectionIndex = 0, sectionCount = 1) {
  const safeTitle = escapeHtml(title);
  const filterCount = activeFilterCount();
  const expanded = isFilterPanelOpen ? "true" : "false";
  const currentSection = String(sectionIndex + 1).padStart(2, "0");
  const totalSections = String(sectionCount).padStart(2, "0");
  return `
<header class="category-header">
  <div class="category-header__cell">
    <h2 class="category-title"><span class="category-index">${currentSection}</span>${safeTitle}</h2>
  </div>
  <button class="category-header__cell filter-trigger" type="button" data-filter-toggle aria-expanded="${expanded}" aria-controls="catalog-filters-panel">
    <span class="filter-trigger__label">Фильтр</span>
    <span class="filter-trigger__count">(${filterCount})</span>
  </button>
  <p class="category-header__cell category-header__meta">${count} предметов</p>
  <p class="category-header__cell category-header__position">${currentSection} / ${totalSections}</p>
</header>`;
}

function detachFilterPanel() {
  const panel = document.getElementById("catalog-filters-panel");
  const main = document.querySelector(".catalog-main");
  const root = document.getElementById("catalog-root");
  if (!panel || !main || !root) return;
  if (panel.parentElement !== main) {
    main.insertBefore(panel, root);
  }
}

function attachPanelToFirstSection() {
  const panel = document.getElementById("catalog-filters-panel");
  const root = document.getElementById("catalog-root");
  if (!panel || !root) return;
  const firstHeader = root.querySelector(".category-header");
  if (firstHeader) {
    firstHeader.insertAdjacentElement("afterend", panel);
  }
}

function renderCatalog() {
  const root = document.getElementById("catalog-root");
  if (!root || typeof PRODUCTS === "undefined") return;

  detachFilterPanel();

  const visibleProducts = sortProducts(getFilteredProducts());

  const showSections =
    activeCategoryFilter === "all" &&
    selectedSizes.size === 0 &&
    selectedColors.size === 0;

  if (showSections) {
    const groups = groupProductsBySections(visibleProducts);
    root.innerHTML = groups
      .map(
        (group, index) => `
<section class="catalog-section-block" data-section="${group.id}">
  ${renderCategoryHeader(group.title, group.items.length, index, groups.length)}
  <div class="catalog-grid" role="list">
    ${group.items.map((product, index) => renderProductCard(product, index)).join("")}
  </div>
</section>`
      )
      .join("");
  } else {
    const title =
      activeCategoryFilter === "all" ? "Каталог" : activeCategoryFilter;
    root.innerHTML = `
<section class="catalog-section-block">
  ${renderCategoryHeader(title, visibleProducts.length, 0, 1)}
  <div class="catalog-grid" role="list">
    ${visibleProducts.map((product, index) => renderProductCard(product, index)).join("")}
  </div>
</section>`;
  }

  if (isFilterPanelOpen) {
    attachPanelToFirstSection();
  }
}

function syncCatalogMasthead() {
  const count = document.querySelector("[data-catalog-total]");
  if (count && typeof PRODUCTS !== "undefined") {
    count.textContent = String(PRODUCTS.length).padStart(2, "0");
  }

  document.querySelectorAll("[data-catalog-category]").forEach((link) => {
    const isCurrent = link.getAttribute("data-catalog-category") === activeCategoryFilter;
    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function syncFilterTriggers() {
  const expanded = isFilterPanelOpen ? "true" : "false";
  document.querySelectorAll("[data-filter-toggle]").forEach((trigger) => {
    trigger.setAttribute("aria-expanded", expanded);
  });
}

function setupFilterToggle() {
  const panel = document.getElementById("catalog-filters-panel");
  if (!panel) return;

  panel.removeAttribute("hidden");
  panel.classList.add("is-collapsed");

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-filter-toggle]");
    if (!trigger) return;
    e.preventDefault();

    const section = trigger.closest(".catalog-section-block");

    if (isFilterPanelOpen && section && section.contains(panel)) {
      isFilterPanelOpen = false;
      panel.classList.add("is-collapsed");
    } else {
      isFilterPanelOpen = true;
      panel.classList.remove("is-collapsed");
      if (section) {
        const header = section.querySelector(".category-header");
        if (header) header.insertAdjacentElement("afterend", panel);
      }
    }
    syncFilterTriggers();
  });
}

function setupCategoryFilters() {
  const buttons = document.querySelectorAll("[data-filter-category]");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.classList.toggle(
      "is-active",
      btn.getAttribute("data-filter-category") === activeCategoryFilter
    );

    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-filter-category") || "all";
      activeCategoryFilter = value;
      buttons.forEach((b) =>
        b.classList.toggle(
          "is-active",
          b.getAttribute("data-filter-category") === value
        )
      );
      const url = new URL(window.location.href);
      if (value === "all") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", value);
      }
      window.history.replaceState({}, "", url);
      syncCatalogMasthead();
      renderCatalog();
    });
  });
}

function setupSizeFilters() {
  const buttons = document.querySelectorAll("[data-filter-size]");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-filter-size") || "";
      if (selectedSizes.has(value)) {
        selectedSizes.delete(value);
        btn.classList.remove("is-active");
      } else {
        selectedSizes.add(value);
        btn.classList.add("is-active");
      }
      renderCatalog();
    });
  });
}

function setupColorFilters() {
  const buttons = document.querySelectorAll("[data-filter-color]");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-filter-color") || "";
      if (selectedColors.has(value)) {
        selectedColors.delete(value);
        btn.classList.remove("is-active");
      } else {
        selectedColors.add(value);
        btn.classList.add("is-active");
      }
      renderCatalog();
    });
  });
}

function setupSortFilters() {
  const buttons = document.querySelectorAll("[data-sort]");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-sort") || "default";
      activeSortMode = value;
      buttons.forEach((b) =>
        b.classList.toggle("is-active", b.getAttribute("data-sort") === value)
      );
      renderCatalog();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupCategoryFromUrl();
  syncCatalogMasthead();
  setupFilterToggle();
  setupCategoryFilters();
  setupSizeFilters();
  setupColorFilters();
  setupSortFilters();
  renderCatalog();
});
