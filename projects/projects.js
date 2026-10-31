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

// Keep search and year selection independent so every interaction can be combined.
let query = "";
let selectedYear = null;

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
  arcData.forEach((arcDatum, idx) => {
    let year = arcDatum.data.label;
    d3.select("#projects-pie-plot")
      .append("path")
      .attr("d", arcs[idx])
      .attr("fill", colors(years.indexOf(year)))
      .classed("selected", year === selectedYear)
      .on("click", () => {
        selectedYear = selectedYear === year ? null : year;
        update();
      });
  });

  // The --color custom property gives each swatch the same color as its pie slice.
  let legend = d3.select(".legend");
  data.forEach((d) => {
    legend
      .append("li")
      .attr("style", `--color:${colors(years.indexOf(d.label))}`)
      .attr("class", "legend-item")
      .classed("selected", d.label === selectedYear)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on("click", () => {
        selectedYear = selectedYear === d.label ? null : d.label;
        update();
      });
  });
}

// Combine both filters so a slice click cannot discard an active search condition.
function getVisibleProjects() {
  return projects.filter((project) => {
    let matchesQuery = Object.values(project)
      .join("\n").toLowerCase()
      .includes(query.toLowerCase());
    let matchesYear = selectedYear === null || project.year === selectedYear;
    return matchesQuery && matchesYear;
  });
}

// Redraw the pie from search matches alone, and render cards using both active filters.
function update() {
  let searchFiltered = projects.filter((project) => {
    let values = Object.values(project).join("\n").toLowerCase();
    return values.includes(query.toLowerCase());
  });
  if (!searchFiltered.some((project) => project.year === selectedYear)) {
    selectedYear = null;
  }
  renderPieChart(searchFiltered);
  renderProjects(getVisibleProjects(), projectsContainer, "h2");
}

// Update the query and refresh both views as the user types.
let searchInput = document.querySelector(".searchBar");
if (searchInput && Array.isArray(projects)) {
  searchInput.addEventListener("input", (event) => {
    query = event.target.value;
    update();
  });
}

// Render the full chart and card list on load before any interaction occurs.
if (Array.isArray(projects)) {
  update();
}
