console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Define the pages and labels shown in the navigation.
let pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "contact/", title: "Contact" },
  { url: "cv/", title: "CV" },
  { url: "https://github.com/dmittz", title: "GitHub" },
];

// Create the navigation and add it at the start of the body.
let nav = document.createElement("nav");
document.body.prepend(nav);

// Use the site root locally and the GitHub Pages subdirectory when deployed.
const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/"
    : "/DSC-Portfolio/";

// Build each link, highlighting the current page and opening external links in a new tab.
for (let p of pages) {
  let { url, title } = p;
  url = !url.startsWith("http") ? BASE_PATH + url : url;

  let a = document.createElement("a");
  a.href = url;
  a.textContent = title;
  nav.append(a);

  a.classList.toggle(
    "current",
    a.host === location.host && a.pathname === location.pathname,
  );

  // Set target directly for external links instead of creating an empty target attribute.
  if (a.host !== location.host) {
    a.target = "_blank";
  }
}
