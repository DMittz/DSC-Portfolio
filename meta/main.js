import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// Load the code-location data and convert numeric and date columns.
async function loadData() {
  const data = await d3.csv("loc.csv", (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + "T00:00" + row.timezone),
    datetime: new Date(row.datetime),
  }));
  return data;
}

// Group source lines by commit and summarize each commit.
function processCommits(data) {
  return d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
    const { author, date, time, timezone, datetime } = lines[0];
    const result = {
      id: commit,
      url: "https://github.com/dmittz/DSC-Portfolio/commit/" + commit,
      author,
      date,
      time,
      timezone,
      datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length,
    };

    // Non-enumerable keeps the original rows accessible without cluttering listings.
    Object.defineProperty(result, "lines", {
      value: lines,
      enumerable: false,
      configurable: true,
      writable: true,
    });

    return result;
  });
}

// Render repository-wide summary statistics.
function renderCommitInfo(data, commits) {
  const stats = d3.select("#stats").append("dl").attr("class", "stats");

  function appendStat(label, value, useHtml = false) {
    const item = stats.append("div").attr("class", "stat");
    const term = item.append("dt");
    if (useHtml) {
      term.html(label);
    } else {
      term.text(label);
    }
    item.append("dd").text(value);
  }

  // Whole-dataset aggregate: count all source lines.
  appendStat('Total <abbr title="Lines of code">LOC</abbr>', data.length, true);

  // Whole-dataset aggregate: count the processed commits.
  appendStat("Total commits", commits.length);

  // Distinct count: count unique file groups.
  appendStat("Number of files", d3.group(data, (d) => d.file).size);

  // Min/max row: select the greatest nesting depth.
  appendStat("Maximum depth", d3.max(data, (d) => d.depth));

  // Min/max row: select the greatest line length.
  appendStat("Longest line (in characters)", d3.max(data, (d) => d.length));

  // Grouped aggregate: average each file's maximum line number.
  const fileLengths = d3.rollups(
    data,
    (lines) => d3.max(lines, (d) => d.line),
    (d) => d.file,
  );
  appendStat(
    "Average file length (in lines)",
    Math.round(d3.mean(fileLengths, ([, maxLine]) => maxLine)),
  );

  // Grouped aggregate: find the time-of-day period with the most source lines.
  const workByDayPeriod = d3.rollups(
    data,
    (lines) => lines.length,
    (d) => new Date(d.datetime).toLocaleString("en", { dayPeriod: "short" }),
  );
  appendStat(
    "Time of day with the most work",
    d3.greatest(workByDayPeriod, (d) => d[1])?.[0],
  );
}

// Fill the tooltip with details for the hovered commit.
function renderTooltipContent(commit) {
  const link = document.getElementById("commit-link");
  const date = document.getElementById("commit-date");
  const time = document.getElementById("commit-time");
  const author = document.getElementById("commit-author");
  const lines = document.getElementById("commit-lines");

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString("en", {
    dateStyle: "full",
  });
  time.textContent = commit.datetime?.toLocaleTimeString("en", {
    timeStyle: "short",
  });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

// Show or hide the commit details panel.
function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById("commit-tooltip");
  tooltip.hidden = !isVisible;
}

// Position the tooltip at the pointer's current viewport coordinates.
function updateTooltipPosition(event) {
  const tooltip = document.getElementById("commit-tooltip");
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

// Plot each commit by its timestamp and time of day.
function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("overflow", "visible");

  // Leave 40px on the left so the "00:00" y-axis labels are not clipped.
  const margin = { top: 10, right: 10, bottom: 30, left: 40 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();
  const yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  // Draw grid lines first; an unlabeled axis with long ticks forms the grid.
  const gridlines = svg
    .append("g")
    .attr("class", "gridlines")
    .attr("transform", `translate(${usableArea.left}, 0)`);
  gridlines.call(
    d3.axisLeft(yScale).tickFormat(() => "").tickSize(-usableArea.width),
  );

  // Draw axes before the dots so the points remain visible above them.
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");
  svg
    .append("g")
    .attr("transform", `translate(0, ${usableArea.bottom})`)
    .call(xAxis);
  svg
    .append("g")
    .attr("transform", `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  // Modulo 24 wraps the hours, padStart adds a leading zero, and ":00" adds minutes.
  // Draw dots last, above the grid lines and axes.
  const dots = svg.append("g").attr("class", "dots");
  dots
    .selectAll("circle")
    .data(commits)
    .join("circle")
    .attr("cx", (d) => xScale(d.datetime))
    .attr("cy", (d) => yScale(d.hourFrac))
    .attr("r", 5)
    .attr("fill", "steelblue")
    // Keep tooltip content and visibility in sync with the hovered commit.
    .on("mouseenter", (event, commit) => {
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on("mouseleave", () => {
      updateTooltipVisibility(false);
    });
}

let data = await loadData();
let commits = processCommits(data);
renderCommitInfo(data, commits);
renderScatterPlot(data, commits);
