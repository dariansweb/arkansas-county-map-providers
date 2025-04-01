document.addEventListener("DOMContentLoaded", function () {
  const mapContainer = document.getElementById("map-container");
  const legendList = document.getElementById("legend-list");
  const tooltip = d3.select("body").append("div").attr("class", "tooltip");

  let countyDataMap = {};
  let providerDataMap = {};
  let providerLegend = {};
  let currentMode = "heatmap";

  // Utility function to update legend
  function renderLegend(mode) {
    legendList.innerHTML = ""; // Clear existing
    if (mode === "providers") {
      Object.entries(providerLegend).forEach(([provider, info]) => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="color-box" style="background:${info.color}"></span> ${provider}`;
        legendList.appendChild(li);
      });
    } else {
      // Show heatmap scale info
      const li = document.createElement("li");
      li.innerHTML = `<span style="color:#555;">Counties shaded from light to dark orange based on average services per 1,000 youth (10–19).</span>`;
      legendList.appendChild(li);
    }
  }

  // Tooltip content
  function getTooltipContent(id, mode) {
    if (mode === "heatmap" && countyDataMap[id]) {
      const d = countyDataMap[id];
      return `
        <strong>${id} County</strong><br/>
        Population: ${d.population.toLocaleString()}<br/>
        Youth (10–19): ${d.youth_population.toLocaleString()}<br/>
        Avg Services: ${d.avg_services}<br/>
        Per 1k Youth: ${d.services_per_1000_youth}
      `;
    } else if (mode === "providers" && providerDataMap[id]) {
      const d = providerDataMap[id];
      return `
        <strong>${id} County</strong><br/>
        Provider: ${d.provider}<br/>
        Avg Services (2020–2024): ${d.avg_services}
      `;
    }
    return `<strong>${id} County</strong><br/>No data available`;
  }

  // Apply fill color based on selected mode
  function applyMapColors(svg, mode) {
    svg.selectAll("path").each(function () {
      const path = d3.select(this);
      const id = path.attr("id");

      if (mode === "heatmap" && countyDataMap[id]) {
        const val = countyDataMap[id].services_per_1000_youth;
        path.attr("fill", heatColor(val));
      } else if (mode === "providers" && providerDataMap[id]) {
        path.attr("fill", providerDataMap[id].color);
      } else {
        path.attr("fill", "#eee");
      }

      // Tooltip binding
      path
        .on("mouseover", function (event) {
          tooltip.transition().duration(200).style("opacity", 0.95);
          tooltip
            .html(getTooltipContent(id, mode))
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(300).style("opacity", 0);
        });
    });
  }

  // Define heatmap color scale
  let heatColor;

  // Load all required data
  Promise.all([
    fetch("data/COUNTY_BOUNDARY.svg").then((res) => res.text()),
    fetch("data/processed-counties.json").then((res) => res.json()),
    fetch("data/provider-coverage.json").then((res) => res.json()),
    fetch("data/provider-legend.json").then((res) => res.json()),
  ]).then(([svgText, countyData, providerMap, legendMap]) => {
    // Store references
    countyData.forEach((d) => (countyDataMap[d.county] = d));
    providerDataMap = providerMap;
    providerLegend = legendMap;

    // Set up color scale for heatmap
    const maxVal = d3.max(countyData, (d) => d.services_per_1000_youth);
    heatColor = d3.scaleSequential(d3.interpolateOranges).domain([0, maxVal]);

    // Load the SVG into the map container
    mapContainer.innerHTML = svgText;
    const svg = d3.select("#map-container svg");

    // Initial render
    renderLegend(currentMode);
    applyMapColors(svg, currentMode);

    // Handle toggle
    document.querySelectorAll("input[name='mapMode']").forEach((input) => {
      input.addEventListener("change", () => {
        currentMode = input.value;
        renderLegend(currentMode);
        applyMapColors(svg, currentMode);
      });
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-description");
  const descriptionBox = document.getElementById("data-description");

  toggleBtn.addEventListener("click", () => {
    const isVisible = descriptionBox.style.display === "block";
    descriptionBox.style.display = isVisible ? "none" : "block";
    toggleBtn.textContent = isVisible
      ? "Show Map Explanation"
      : "Hide Map Explanation";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("top5-chart");
  const width = container.offsetWidth || 800; // fallback if container is collapsed
  const height = 300;

  fetch("data/cbp-region-summary.json")
    .then((res) => res.json())
    .then((data) => {
      const top5 = data
        .sort((a, b) => a.services_per_1000_youth - b.services_per_1000_youth)
        .slice(0, 5);

      const margin = { top: 30, right: 30, bottom: 30, left: 160 };
      const width = 800;
      const height = 300;

      const svg = d3
        .select("#top5-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .classed("responsive-svg", true);

      const x = d3
        .scaleLinear()
        .domain([0, d3.max(top5, (d) => d.services_per_1000_youth)])
        .range([margin.left, width - margin.right]);

      const y = d3
        .scaleBand()
        .domain(top5.map((d) => d.provider))
        .range([margin.top, height - margin.bottom])
        .padding(0.2);

      svg
        .append("g")
        .call(d3.axisLeft(y))
        .attr("transform", `translate(${margin.left},0)`);

      svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

      svg
        .selectAll("rect")
        .data(top5)
        .enter()
        .append("rect")
        .attr("x", margin.left)
        .attr("y", (d) => y(d.provider))
        .attr("width", (d) => x(d.services_per_1000_youth) - margin.left)
        .attr("height", y.bandwidth())
        .attr("fill", "#f44336");

      svg
        .selectAll("text.value")
        .data(top5)
        .enter()
        .append("text")
        .attr("x", (d) => x(d.services_per_1000_youth) + 5)
        .attr("y", (d) => y(d.provider) + y.bandwidth() / 2 + 4)
        .text((d) => d.services_per_1000_youth)
        .attr("fill", "#333")
        .style("font-size", "0.8rem");
    });
});
