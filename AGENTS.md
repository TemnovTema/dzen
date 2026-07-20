# AGENTS.md — Dzen Store

## Project Goal
Build and maintain a minimal dark brand-store website for "Дзен":
- `index.html` (catalog)
- `product.html` (product page)
- `cart.html` (cart)
- `about.html` (brand page)

No extra sections, no feature creep.

---

## Visual Direction (strict)
Keep:
- dark background
- white graphic borders
- modular symmetry
- generous spacing
- clean typography
- restrained "zen" tone

Avoid:
- chaotic layouts
- random offsets/margins
- masonry
- oversized full-width media
- decorative side ornaments
- inline mega-CSS in HTML

---

## Stack / Architecture
- Plain HTML/CSS/JS only
- No frameworks, no external UI libs
- Reusable CSS split:
  - `css/reset.css`
  - `css/variables.css`
  - `css/base.css`
  - `css/layout.css`
  - `css/components.css`
  - `css/pages.css`
- JS split:
  - `js/data.js`
  - `js/main.js`
  - `js/product.js`
  - `js/cart.js`
- Assets in:
  - `assets/images`
  - `assets/fonts`

---

## Hard Rules for Agent
1. Do not rewrite the whole project when task is local.
2. Preserve existing page map and navigation unless user explicitly asks otherwise.
3. Keep components consistent across pages (same structure, same spacing system).
4. Prefer editing existing tokens/components before adding ad-hoc styles.
5. No duplicate component variants unless requested.
6. Keep hover/interactive states deterministic (no layout shift).
7. Any card/grid change must preserve:
   - equal card sizes
   - fixed grid rhythm
   - no overflow/cropping bugs
8. Respect accessibility basics:
   - semantic tags
   - alt text
   - focus-visible states
   - buttons as buttons, links as links

---

## Design Tokens (source of truth)
Use variables from `css/variables.css` only:
- colors
- spacing
- border thickness
- card size
- typography families

Do not hardcode random pixel values when a token exists.

---

## Product Card Contract (catalog)
Default state:
- image only
- no meta below card

Hover state:
- fixed overlay occupying exact card area
- title (single line, ellipsis)
- description (max 2 lines)
- price
- primary action button

No category, no extra labels, no dynamic height growth.

---

## Cart Rules
- Storage key: `dzenCart`
- Item shape:
  - `id`
  - `size` (`null` if not applicable)
  - `quantity`
- Validate quantity >= 1
- Keep cart badge in sync globally

---

## Coding Style
- Keep functions small and explicit
- Escape user-facing dynamic HTML
- Avoid dead code and duplicated helpers
- Keep naming predictable and component-scoped

---

## Change Discipline
For each change:
1. Make smallest possible diff.
2. Reuse existing CSS classes/tokens when possible.
3. Verify no layout jump at hover/focus.
4. Verify breakpoints: 1440+, 1200, 900, 768, 390.
5. Ensure no horizontal scroll.

---

## What to Never Do
- Reintroduce legacy side effects from old layouts
- Mix multiple card systems in parallel
- Move core styles back into HTML `<style>` blocks
- Add marketing fluff content without request
- Rename routes/pages without explicit request
