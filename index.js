import { fetchJSON, renderProjects } from "./global.js";

// Fetch the project data.
const projects = await fetchJSON("./lib/projects.json");

// Keep the three latest projects.
const latestProjects = projects.slice(0, 3);

// Select the projects container.
const projectsContainer = document.querySelector(".projects");

// Render the latest projects.
renderProjects(latestProjects, projectsContainer, "h2");
