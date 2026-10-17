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

// Insert the theme selector at the start of the page.
document.body.insertAdjacentHTML(
  "afterbegin",
  `
      <label class="color-scheme">
        Theme:
        <select>
          <option value="light dark">Automatic</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>`,
);

// Get the theme selector and provide a shared way to set the page color scheme.
let select = document.querySelector(".color-scheme select");

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty("color-scheme", colorScheme);
}

// Apply and persist the selected theme whenever the selector changes.
select.addEventListener("input", (event) => {
  console.log("color scheme changed to", event.target.value);
  setColorScheme(event.target.value);
  localStorage.colorScheme = event.target.value;
});

// Restore the saved theme and keep the selector in sync.
if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
  select.value = localStorage.colorScheme;
}
