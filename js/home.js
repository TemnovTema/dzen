document.addEventListener("DOMContentLoaded", () => {
  const stage = document.querySelector("[data-animation-stage]");
  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const controls = Array.from(document.querySelectorAll("[data-hero-control]"));

  if (!stage || slides.length < 2 || controls.length !== slides.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let timer = null;

  const showSlide = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === activeIndex);
    });

    controls.forEach((control, index) => {
      const isActive = index === activeIndex;
      control.classList.toggle("is-active", isActive);
      control.setAttribute("aria-pressed", String(isActive));
    });
  };

  const stopRotation = () => {
    window.clearInterval(timer);
    timer = null;
  };

  const startRotation = () => {
    stopRotation();
    if (reduceMotion.matches || document.hidden) return;
    timer = window.setInterval(() => showSlide(activeIndex + 1), 6500);
  };

  controls.forEach((control) => {
    control.addEventListener("click", () => {
      showSlide(Number(control.dataset.heroControl));
      startRotation();
    });
  });

  stage.addEventListener("pointerenter", stopRotation);
  stage.addEventListener("pointerleave", startRotation);
  stage.addEventListener("focusin", stopRotation);
  stage.addEventListener("focusout", startRotation);
  document.addEventListener("visibilitychange", startRotation);
  reduceMotion.addEventListener("change", startRotation);

  startRotation();
});
