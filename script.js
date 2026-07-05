const sections = Array.from(document.querySelectorAll("main section[id]"));
const navLinks = new Map(
  Array.from(document.querySelectorAll(".top-nav a")).map((link) => [
    link.getAttribute("href").slice(1),
    link,
  ]),
);

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => link.removeAttribute("aria-current"));
    navLinks.get(visible.target.id)?.setAttribute("aria-current", "true");
  },
  {
    rootMargin: "-20% 0px -65% 0px",
    threshold: [0.1, 0.3, 0.6],
  },
);

sections.forEach((section) => observer.observe(section));

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
