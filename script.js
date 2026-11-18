const newsToggle = document.querySelector(".news-toggle");
const newsList = document.querySelector(".news-list");
const extraNewsItems = Array.from(document.querySelectorAll(".news-extra"));

newsToggle?.addEventListener("click", () => {
  const expanded = newsToggle.getAttribute("aria-expanded") === "true";
  const nextExpanded = !expanded;

  newsToggle.setAttribute("aria-expanded", String(nextExpanded));
  newsToggle.textContent = nextExpanded ? "Show less" : "Show all news";
  newsList?.classList.toggle("is-collapsed", !nextExpanded);

  extraNewsItems.forEach((item) => {
    item.hidden = !nextExpanded;
  });
});

// Keep the figure's natural proportions; magnify around the pointer on desktop.
const figureMotion = window.matchMedia(
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
);

for (const figure of document.querySelectorAll(".pub-image")) {
  const resetFigure = () => {
    figure.classList.remove("is-exploring");
    figure.style.removeProperty("--figure-x");
    figure.style.removeProperty("--figure-y");
  };

  figure.addEventListener("pointermove", (event) => {
    if (!figureMotion.matches || event.pointerType !== "mouse") return;

    const bounds = figure.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
    figure.style.setProperty("--figure-x", `${x}%`);
    figure.style.setProperty("--figure-y", `${y}%`);
    figure.classList.add("is-exploring");
  });

  figure.addEventListener("pointerleave", resetFigure);
  figure.addEventListener("pointercancel", resetFigure);
  figureMotion.addEventListener("change", resetFigure);
}
