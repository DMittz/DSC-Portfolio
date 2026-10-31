// Import D3 for generating the pie chart.
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
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

let data = [1, 2, 3, 4, 5, 5];

// Generate SVG path data for pie slices with a zero-radius inner circle.
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Convert the temporary values into pie-slice angles.
let sliceGenerator = d3.pie();
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

// Assign each slice a color from D3's Tableau palette.
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// Draw each slice into the projects chart; colors is a function, so call it with colors(idx).
arcs.forEach((arc, idx) => {
  d3.select("#projects-pie-plot")
    .append("path")
    .attr("d", arc)
    .attr("fill", colors(idx));
});
