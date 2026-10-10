const startSelect = document.getElementById("start");
const destinationSelect = document.getElementById("destination");
const findButton = document.getElementById("find-route");
const swapButton = document.getElementById("swap");
const message = document.getElementById("message");
const resultPanel = document.getElementById("route-result");
const distanceText = document.getElementById("distance");
const stopsText = document.getElementById("stops");
const directions = document.getElementById("directions");
const routeLines = document.getElementById("route-lines");
const buildingButtons = [...document.querySelectorAll(".building")];

function updateSelectedMarkers(path = []) {
  const start = startSelect.value;
  const destination = destinationSelect.value;

  buildingButtons.forEach((button) => {
    const name = button.dataset.building;
    button.classList.toggle("selected-start", name === start);
    button.classList.toggle("selected-end", name === destination);
    button.classList.toggle("on-route", path.includes(name));
  });
}

function drawRoute(path) {
  routeLines.innerHTML = "";
  if (!path || path.length < 2) return;

  // SVG viewBox is 100 x 70, matching the illustrative map coordinates.
  for (let i = 0; i < path.length - 1; i++) {
    const a = window.CAMPUS_POSITIONS[path[i]];
    const b = window.CAMPUS_POSITIONS[path[i + 1]];
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", a[0]);
    line.setAttribute("y1", a[1]);
    line.setAttribute("x2", b[0]);
    line.setAttribute("y2", b[1]);
    line.setAttribute("class", "route-edge");
    routeLines.appendChild(line);
  }
}

function showError(text) {
  message.textContent = text;
  message.classList.add("error");
  resultPanel.hidden = true;
  routeLines.innerHTML = "";
  updateSelectedMarkers();
}

async function findRoute() {
  const start = startSelect.value;
  const destination = destinationSelect.value;
  message.classList.remove("error");
  message.textContent = "Calculating shortest route…";
  findButton.disabled = true;

  try {
    // Send the selected locations to the Python Flask API.
    const response = await fetch("/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start, destination })
    });
    const data = await response.json();

    if (!response.ok) {
      showError(data.error || "Could not calculate this route.");
      return;
    }

    drawRoute(data.path);
    updateSelectedMarkers(data.path);
    distanceText.textContent = `${data.distance} m`;
    stopsText.textContent = data.path.length;
    directions.innerHTML = "";

    data.path.forEach((building, index) => {
      const item = document.createElement("li");
      item.textContent = index === 0
        ? `Start at ${building}`
        : index === data.path.length - 1
          ? `Arrive at ${building}`
          : `Continue to ${building}`;
      directions.appendChild(item);
    });

    resultPanel.hidden = false;
    message.textContent = data.path.length === 1
      ? "You're already at your destination."
      : "Shortest route found using Dijkstra's algorithm.";
  } catch (error) {
    showError("Unable to contact the Python server. Is Flask running?");
  } finally {
    findButton.disabled = false;
  }
}

findButton.addEventListener("click", findRoute);

swapButton.addEventListener("click", () => {
  const oldStart = startSelect.value;
  startSelect.value = destinationSelect.value;
  destinationSelect.value = oldStart;
  routeLines.innerHTML = "";
  resultPanel.hidden = true;
  message.classList.remove("error");
  message.textContent = "Locations swapped. Find a route to update the map.";
  updateSelectedMarkers();
});

[startSelect, destinationSelect].forEach((select) => {
  select.addEventListener("change", () => {
    routeLines.innerHTML = "";
    resultPanel.hidden = true;
    message.classList.remove("error");
    message.textContent = "Locations changed. Find a route to update the map.";
    updateSelectedMarkers();
  });
});

buildingButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const building = button.dataset.building;
    // A map click sets the destination; if it is already the destination, use it as the start.
    if (building === destinationSelect.value) {
      startSelect.value = building;
      const alternative = [...destinationSelect.options].find(option => option.value !== building);
      if (alternative) destinationSelect.value = alternative.value;
    } else {
      destinationSelect.value = building;
    }
    routeLines.innerHTML = "";
    resultPanel.hidden = true;
    message.classList.remove("error");
    message.textContent = `${building} selected. Find a route to calculate directions.`;
    updateSelectedMarkers();
  });
});

updateSelectedMarkers();
