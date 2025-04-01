// Helper functions
function getCountyDataByName(name) {
  const normalized = name.trim().toLowerCase();
  return window.countyData.find((c) => {
    const n = c.name?.trim().toLowerCase();
    return n === normalized || n === normalized + " county";
  });
}

function getProviderNameFromCode(code) {
  const match = providers.find((p) => p.code === code);
  return match?.provider || code;
}

document.getElementById("close-modal").onclick = () => {
  document.getElementById("county-modal").classList.add("hidden");
};

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

  Promise.all([
    fetch("data/COUNTY_BOUNDARY.svg").then((res) => res.text()),
    fetch("data/cbp-region-summary.json").then((res) => res.json()),
    fetch("data/processed-counties.json").then((res) => res.json()),
    fetch("data/provider-coverage.json").then((res) => res.json()),
    fetch("data/provider-legend.json").then((res) => res.json()),
  ]).then(([svgText, cbpSummary, countyData, providerMap, legendMap]) => {
    // Map CBP summary data

    window.countyDataMap = {};
    window.providerDataMap = {};
    window.providerCoverage = providerMap;
    window.providerLegend = legendMap;
    window.countyDataMap = countyDataMap;
    window.cbpSummary = cbpSummary;

    // Store references
    countyData.forEach((d) => (countyDataMap[d.county] = d));
    providerDataMap = providerMap;
    providerLegend = legendMap;

    // First create provider summary mapping
    const providerSummaryMap = {};
    cbpSummary.forEach((d) => {
      if (d.provider?.trim()) {
        providerSummaryMap[d.provider.trim()] = {
          counties_count: d.counties_count,
          youth_population: d.youth_population,
          avg_services: d.avg_services,
          services_per_1000_youth: d.services_per_1000_youth,
        };
      }
    });

    // Map provider data with the summary data included
    Object.entries(providerMap).forEach(([county, d]) => {
      const countyId = county.trim().toUpperCase();
      if (d.provider && providerSummaryMap[d.provider]) {
        // Merge the summary data with the provider data
        window.providerDataMap[countyId] = {
          ...d,
          ...providerSummaryMap[d.provider],
        };
      }
      window.providerDataMap[countyId] = d;
    });
    console.log("Provider Summary Map:", providerSummaryMap);

    Object.entries(providerMap).forEach(([county, d]) => {
      const countyId = county.trim().toUpperCase();
      if (d.provider && providerSummaryMap[d.provider]) {
        // Merge the summary data with the provider data
        window.providerDataMap[countyId] = {
          ...d,
          ...providerSummaryMap[d.provider],
        };
      } else {
        window.providerDataMap[countyId] = d;
      }
    });

    // Log the final provider data map
    console.log("Final Provider Data Map:", window.providerDataMap);

    // Pick a specific provider to verify its data
    const sampleProvider = Object.values(window.providerDataMap)[0];
    console.log("Sample Provider Data:", sampleProvider);
    console.log(
      "Sample Provider counties_count:",
      sampleProvider?.counties_count
    );

    if (sampleProvider) {
      console.log("Sample Provider Data:", {
        provider: sampleProvider,
        data: providerSummaryMap[sampleProvider?.provider],
        counties_count_type:
          typeof providerSummaryMap[sampleProvider?.provider]?.counties_count,
      });
    }

    // Map county data using county ID as the key
    countyData.forEach((d) => {
      const countyId = d.county?.trim().toUpperCase();
      if (countyId) {
        window.countyDataMap[countyId] = d;
      }
    });

    // Map provider data
    Object.entries(providerMap).forEach(([county, d]) => {
      const countyId = county.trim().toUpperCase();
      window.providerDataMap[countyId] = d;
    });
    Object.values(providerMap).forEach((d) => {
      const provider = d.provider?.trim();
      if (provider) {
        window.providerDataMap[provider] = d;
      }
    });

    // console.log("Provider data map:", window.providerDataMap);
    // console.log("Provider legend:", window.providerLegend);

    // Debug logging to verify data loading
    // console.log("Loaded counties:", Object.keys(window.countyDataMap).length);
    // console.log(
    //   "Loaded providers:",
    //   Object.keys(window.providerDataMap).length
    // );

    // Set up color scale for heatmap
    const maxVal = d3.max(countyData, (d) => d.services_per_1000_youth);
    heatColor = d3.scaleSequential(d3.interpolateOranges).domain([0, maxVal]);

    // Load the SVG into the map container
    mapContainer.innerHTML = svgText;
    const svg = d3.select("#map-container svg");

    svg.selectAll("path").on("click", function () {
      const id = d3.select(this).attr("id").trim().toUpperCase(); // Convert to uppercase
      console.log("Clicked county:", id);
      console.log("Current mode:", currentMode);
      showCountyModalFromTooltip(id, currentMode);
    });

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

  function titleCase(str) {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  }

  function showCountyModalFromTooltip(id, mode) {
    const modal = document.getElementById("county-modal");
    const nameHeader = document.getElementById("modal-county-name");
    const container = document.getElementById("modal-data-container");

    const displayName = titleCase(id);
    nameHeader.textContent = `${displayName} County`;

    if (mode === "heatmap" && window.countyDataMap[id]) {
      const d = window.countyDataMap[id];
      container.innerHTML = `
              <p><strong>Total Population:</strong> ${
                d.population?.toLocaleString() || "N/A"
              }</p>
              <p><strong>Youth (10–19):</strong> ${
                d.youth_population?.toLocaleString() || "N/A"
              }</p>
              <p><strong>Avg Services:</strong> ${d.avg_services || "N/A"}</p>
              <p><strong>Per 1k Youth:</strong> ${
                d.services_per_1000_youth || "N/A"
              }</p>
          `;
    } else if (mode === "providers" && window.providerDataMap[id]) {
      const d = window.providerDataMap[id];

      console.log("Modal Data:", {
        id: id,
        fullData: d,
        provider: d.provider,
        counties_count: d.counties_count,
        providerMapEntry: window.providerDataMap[d.provider],
      });

      console.log("Full Provider Data Map:", window.providerDataMap);

      container.innerHTML = `
      <p><strong>Provider:</strong> ${d.provider || "N/A"}</p>
      <p><strong>Counties Served:</strong> ${
        d?.counties_count ||
        window.providerDataMap[d.provider]?.counties_count ||
        "N/A"
      }</p>
      <p><strong>Avg Services (2020–2024):</strong> ${
        d?.avg_services || "N/A"
      }</p>
  `;
    } else {
      container.innerHTML = `<p>No data available for ${displayName}</p>`;
    }

    modal.style.cssText = `
    display: flex !important;
    position: fixed !important;
    z-index: 9999 !important;
  `;
    modal.classList.remove("hidden");

    //document.body.style.overflow = "hidden";

    modal.style.display = "flex";
    modal.classList.remove("hidden");

    // Add click event to close modal when clicking outside
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        hideModal();
      }
    });
  }

  function hideModal() {
    const modal = document.getElementById("county-modal");
    modal.style.display = "none";
    modal.classList.add("hidden");
    // Re-enable body scrolling
    document.body.style.overflow = "visible";
  }
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
