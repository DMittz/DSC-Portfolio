console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let navLinks = $$("nav a");

// The browser resolves a.host and a.pathname to absolute URL values, even for relative hrefs, so they can be compared directly to location.host and location.pathname.
let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname,
);

// If currentLink is undefined, optional chaining skips the call; if (currentLink) { currentLink.classList.add("current"); } is equivalent.
currentLink?.classList.add("current");
