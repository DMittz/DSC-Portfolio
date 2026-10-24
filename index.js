import { fetchJSON, renderProjects, fetchGitHubData } from "./global.js";

// Fetch the project data.
const projects = await fetchJSON("./lib/projects.json");

// Keep the three latest projects.
const latestProjects = projects.slice(0, 3);

// Select the projects container.
const projectsContainer = document.querySelector(".projects");

// Render the latest projects.
renderProjects(latestProjects, projectsContainer, "h2");

// Fetch GitHub profile statistics.
const githubData = await fetchGitHubData("dmittz");

// Select the profile statistics container.
const profileStats = document.querySelector("#profile-stats");

// Update the statistics when data is available, or show a fallback on failure.
if (profileStats) {
  if (githubData) {
    profileStats.innerHTML = `
      <dl>
        <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
        <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
        <dt>Followers:</dt><dd>${githubData.followers}</dd>
        <dt>Following:</dt><dd>${githubData.following}</dd>
      </dl>`;
  } else {
    profileStats.innerHTML = "<p>GitHub stats are unavailable right now.</p>";
  }
}
