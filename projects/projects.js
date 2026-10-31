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

// Rebuild the pie chart and legend from the projects currently visible.
function renderPieChart(projectsGiven) {
  d3.select("#projects-pie-plot").selectAll("path").remove();
  d3.select(".legend").selectAll("li").remove();

  if (projectsGiven.length === 0) {
    return;
  }

  // d3.rollups groups projects by year and counts each group, returning [year, count] pairs.
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  // Generate SVG path data for pie slices with a zero-radius inner circle.
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  // Specify .value() because pie data objects are not numbers themselves.
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  // Use each year's full-list index so its color stays stable while filtering.
  let years = [...new Set(projects.map((project) => project.year))];
  let colors = d3.scaleOrdinal(d3.schemeTableau10)
    .domain(years.map((year, idx) => idx));

  // Draw each slice using the color index assigned to its year in the full project list.
  arcs.forEach((arc, idx) => {
    d3.select("#projects-pie-plot")
      .append("path")
      .attr("d", arc)
      .attr("fill", colors(years.indexOf(data[idx].label)));
  });

  // The --color custom property gives each swatch the same color as its pie slice.
  let legend = d3.select(".legend");
  data.forEach((d) => {
    legend
      .append("li")
      .attr("style", `--color:${colors(years.indexOf(d.label))}`)
      .attr("class", "legend-item")
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// Draw the full chart on page load so it is visible before the first search.
if (Array.isArray(projects)) {
  renderPieChart(projects);
}

// Store the current query and return projects matching any field case-insensitively.
let query = "";
let searchInput = document.querySelector(".searchBar");
function setQuery(newQuery) {
  query = newQuery;
  return projects.filter((project) => {
    let values = Object.values(project).join("\n").toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

// Update the cards and chart as the user types, while retaining the total page count.
if (searchInput && Array.isArray(projects)) {
  searchInput.addEventListener("input", (event) => {
    let filteredProjects = setQuery(event.target.value);
    renderProjects(filteredProjects, projectsContainer, "h2");
    renderPieChart(filteredProjects);
  });
}
