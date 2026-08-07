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
