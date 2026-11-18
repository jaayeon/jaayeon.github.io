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

// Pan cropped previews with the pointer; open the complete figure in a dialog.
const figureMotion = window.matchMedia(
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
);

const figureViewer = document.createElement("dialog");
figureViewer.className = "figure-viewer";
figureViewer.setAttribute("aria-label", "Full research figure");
const closeFigure = document.createElement("button");
closeFigure.type = "button";
closeFigure.className = "figure-close";
closeFigure.textContent = "Close ×";
const fullFigure = document.createElement("img");
figureViewer.append(closeFigure, fullFigure);
document.body.append(figureViewer);
closeFigure.addEventListener("click", () => figureViewer.close());
figureViewer.addEventListener("click", (event) => {
  if (event.target !== figureViewer) return;
  const bounds = figureViewer.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) figureViewer.close();
});

for (const figure of document.querySelectorAll(".pub-image")) {
  const image = figure.querySelector("img");
  if (!image) continue;
  const wrapper = document.createElement("div");
  wrapper.className = "research-visual";
  figure.before(wrapper);
  wrapper.append(figure);
  const expand = document.createElement("button");
  expand.type = "button";
  expand.className = "figure-expand";
  expand.textContent = "View figure ↗";
  expand.setAttribute("aria-label", `View full figure: ${image.alt}`);
  expand.addEventListener("click", () => {
    fullFigure.src = image.currentSrc || image.src;
    fullFigure.alt = image.alt;
    figureViewer.showModal();
  });
  wrapper.append(expand);
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
