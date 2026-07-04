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
