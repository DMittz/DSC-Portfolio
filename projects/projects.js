import { fetchJSON, renderProjects } from "../global.js";

// Load project data and render it into the projects grid.
const projects = await fetchJSON("../lib/projects.json");
const projectsContainer = document.querySelector(".projects");
renderProjects(projects, projectsContainer, "h2");

// Show the number of projects in the page heading when project data is available.
const projectsTitle = document.querySelector(".projects-title");
if (projectsTitle && Array.isArray(projects)) {
  projectsTitle.textContent = `${projects.length} Projects`;
}
