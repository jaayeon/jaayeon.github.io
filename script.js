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
closeFigure.textContent = "×";
closeFigure.setAttribute("aria-label", "Close figure");
const fullFigure = document.createElement("img");
figureViewer.append(closeFigure, fullFigure);
document.body.append(figureViewer);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let closeTimer;
let previousOverflow = "";
const sizeFigureViewer = () => {
  const ratio = fullFigure.naturalWidth / fullFigure.naturalHeight;
  if (!Number.isFinite(ratio) || ratio <= 0) return;
  const width = Math.min(1200, window.innerWidth - 40, (window.innerHeight - 40) * ratio);
  figureViewer.style.setProperty("--viewer-width", `${Math.max(1, width)}px`);
};
const dismissFigure = () => {
  if (!figureViewer.open || closeTimer) return;
  figureViewer.classList.remove("is-visible");
  if (reducedMotion.matches) figureViewer.close();
  else closeTimer = window.setTimeout(() => figureViewer.close(), 220);
};
fullFigure.addEventListener("load", sizeFigureViewer);
window.addEventListener("resize", () => {
  if (figureViewer.open) sizeFigureViewer();
});
figureViewer.addEventListener("close", () => {
  window.clearTimeout(closeTimer);
  closeTimer = undefined;
  figureViewer.classList.remove("is-visible");
  document.documentElement.style.overflow = previousOverflow;
});
figureViewer.addEventListener("cancel", (event) => {
  event.preventDefault();
  dismissFigure();
});
closeFigure.addEventListener("click", dismissFigure);
figureViewer.addEventListener("click", (event) => {
  if (event.target !== figureViewer) return;
  const bounds = figureViewer.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) dismissFigure();
});

for (const figure of document.querySelectorAll(".pub-image")) {
  const image = figure.querySelector("img");
  if (!image) continue;
  figure.setAttribute("aria-label", `View full figure: ${image.alt}`);
  figure.addEventListener("click", () => {
    fullFigure.src = image.currentSrc || image.src;
    fullFigure.alt = image.alt;
    const ratio = image.naturalWidth / image.naturalHeight;
    if (Number.isFinite(ratio) && ratio > 0) {
      const width = Math.min(1200, window.innerWidth - 40, (window.innerHeight - 40) * ratio);
      figureViewer.style.setProperty("--viewer-width", `${Math.max(1, width)}px`);
    }
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    figureViewer.showModal();
    // Establish the initial state before starting the opening transition.
    figureViewer.getBoundingClientRect();
    figureViewer.classList.add("is-visible");
  });
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

// Move only the masked foreground in the portrait.
const portraitSubject = document.querySelector(".portrait-subject");
portraitSubject?.addEventListener("pointermove", (event) => {
  if (!figureMotion.matches || event.pointerType !== "mouse") return;
  const bounds = portraitSubject.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  portraitSubject.style.setProperty("--portrait-x", `${(x - 0.5) * 6}px`);
  portraitSubject.style.setProperty("--portrait-y", `${(y - 0.5) * 6}px`);
  portraitSubject.style.setProperty("--portrait-light-x", `${x * 100}%`);
  portraitSubject.style.setProperty("--portrait-light-y", `${y * 100}%`);
});

// Mark the destination once scrolling settles.
let arrivalFrame;
let arrivalTimer;
const highlightResearch = (target) => {
  window.cancelAnimationFrame(arrivalFrame);
  window.clearTimeout(arrivalTimer);
  document.querySelectorAll(".research-card.is-arrival").forEach((card) => card.classList.remove("is-arrival"));
  const started = performance.now();
  let previousTop = null;
  let stableFrames = 0;
  const waitForArrival = () => {
    const top = target.getBoundingClientRect().top;
    stableFrames = previousTop !== null && Math.abs(top - previousTop) < 0.5 ? stableFrames + 1 : 0;
    previousTop = top;
    if (reducedMotion.matches || (stableFrames >= 5 && performance.now() - started > 150) || performance.now() - started > 1800) {
      target.classList.add("is-arrival");
      arrivalTimer = window.setTimeout(() => target.classList.remove("is-arrival"), reducedMotion.matches ? 1800 : 800);
    } else arrivalFrame = window.requestAnimationFrame(waitForArrival);
  };
  arrivalFrame = window.requestAnimationFrame(waitForArrival);
};

// Topic disclosures work with hover, click, touch, and keyboard navigation.
const researchTopics = Array.from(document.querySelectorAll(".focus-topic"));
const hoverTopics = window.matchMedia("(hover: hover) and (pointer: fine)");
const fitTopicPanel = (topic) => {
  const panel = topic.querySelector(".topic-panel");
  panel.style.removeProperty("--panel-shift");
  const bounds = panel.getBoundingClientRect();
  const shift = Math.min(0, window.innerWidth - 20 - bounds.right);
  panel.style.setProperty("--panel-shift", `${Math.max(20 - bounds.left, shift)}px`);
};
for (const topic of researchTopics) {
  let hoverTimer;
  topic.addEventListener("toggle", () => {
    if (!topic.open) return;
    researchTopics.forEach((other) => { if (other !== topic) other.open = false; });
    fitTopicPanel(topic);
  });
  topic.addEventListener("pointerenter", (event) => {
    window.clearTimeout(hoverTimer);
    if (hoverTopics.matches && event.pointerType === "mouse") topic.open = true;
  });
  topic.addEventListener("pointerleave", () => {
    hoverTimer = window.setTimeout(() => {
      if (!topic.matches(":focus-within")) topic.open = false;
    }, 160);
  });
  topic.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    topic.open = false;
    topic.querySelector("summary").focus();
    event.stopPropagation();
  });
  topic.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      const disclosure = target.closest("details");
      if (disclosure) disclosure.open = true;
      topic.open = false;
      history.pushState(null, "", link.hash);
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth", block: "start" });
      highlightResearch(target);
    });
  });
}
document.addEventListener("click", (event) => {
  if (!event.target.closest(".focus-topic")) researchTopics.forEach((topic) => { topic.open = false; });
});
window.addEventListener("resize", () => researchTopics.forEach((topic) => {
  if (topic.open) fitTopicPanel(topic);
}));
