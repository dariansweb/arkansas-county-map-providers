// ///////////////////////// //
// This script will make sure the latest
// repository updates are showing
// leave in head or take out
const cacheBust = `?v=${Date.now()}`;

const script = document.createElement("script");
script.type = "module";
script.src = `../data/countyData-13.js${cacheBust}`;
document.body.appendChild(script);

// For SVG fetch
const originalFetch = window.fetch;
window.fetch = function (resource, init) {
  if (typeof resource === "string" && resource.endsWith(".svg")) {
    resource += cacheBust;
  }
  return originalFetch(resource, init);
};
// End Script for updating data
// ///////////////////////// //

function updateStatsBar(district) {
  const statsBar = document.getElementById("stats-bar");

  if (!district) {
    statsBar.innerHTML = `Show: All Districts | Total Commits: — | Per 1k Youth: —`;
    return;
  }

  const filtered = Object.values(countyData).filter(
    (d) => d.district === district
  );

  const totalYouth = filtered.reduce(
    (sum, d) => sum + d.age10_14.total + d.age15_19.total,
    0
  );

  const totalCommits = filtered.reduce(
    (sum, d) => sum + Object.values(d.Commits).reduce((a, b) => a + b, 0),
    0
  );

  const per1k = totalYouth > 0 ? (totalCommits / totalYouth) * 1000 : 0;

  statsBar.innerHTML = `Show: District ${district} | Total Commits: ${totalCommits} | Per 1k Youth: ${per1k.toFixed(
    2
  )}`;
}

function highlightDistrict(selectedDistrict) {
  Object.entries(countyData).forEach(([county, data]) => {
    const el = d3.select(`#${CSS.escape(county)}`);
    const youth = data.age10_14.total + data.age15_19.total;
    const commits = Object.values(data.Commits).reduce((a, b) => a + b, 0);
    const rate = youth > 0 ? commits / youth : 0;

    if (!el.empty()) {
      if (selectedDistrict === null || data.district === selectedDistrict) {
        el.attr("fill", color(rate))
          .attr("data-color", color(rate))
          .classed("faded", false) // REMOVE faded
          .style("opacity", 1.9);
      } else {
        el.classed("faded", true); // ADD faded to others
      }
    }
  });

  tooltip.style("opacity", 0);
  infoBox.style("display", "none");
  updateStatsBar(selectedDistrict);
}

import { countyData } from "../data/countyData-13.js?v=3";

const uniqueDistricts = Array.from(
  new Set(Object.values(countyData).map((d) => d.district))
).sort((a, b) => {
  const numA = parseInt(a);
  const numB = parseInt(b);

  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return a.localeCompare(b);
});

// 🔥 Now you can use countyData as usual
console.log("Loaded counties:", Object.keys(countyData));

// Calculate max commit rate to normalize coloring
const allCommitRates = Object.values(countyData).map((d) => {
  const youth = d.age10_14.total + d.age15_19.total;
  const totalCommits = Object.values(d.Commits).reduce((a, b) => a + b, 0);
  return youth > 0 ? totalCommits / youth : 0;
});
const maxRate = d3.max(allCommitRates);

const color = d3.scaleQuantize().domain([0, maxRate]).range(d3.schemeReds[9]);

const tooltip = d3.select("#tooltip");
const infoBox = d3.select("#info-box");

fetch("./data/COUNTY_BOUNDARY.svg")
  .then((response) => response.text())
  .then((svgText) => {
    document.getElementById("svg-container").innerHTML = svgText;

    Object.entries(countyData).forEach(([county, data]) => {
      const el = d3.select(`#${CSS.escape(county)}`);
      const youth = data.age10_14.total + data.age15_19.total;
      const totalCommits = Object.values(data.Commits).reduce(
        (a, b) => a + b,
        0
      );
      const rate = youth > 0 ? totalCommits / youth : 0;

      el.attr("fill", color(rate))
        .style("cursor", "pointer")
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`)
            .style("opacity", 1).html(`
            <strong>${county}</strong><br/>
            Population: ${data.pop.toLocaleString()}<br/>
            Commits (5yr): ${totalCommits}<br/>
            Per 1k Youth: ${(rate * 1000).toFixed(2)}
          `);
        })
        .on("mouseout", () => tooltip.style("opacity", 0))
        .on("click", () => {
          infoBox.style("display", "block").html(`
            <h3>${county} County</h3>
            <p><strong>Total Pop (Avg):</strong> ${data.pop.toLocaleString()}</p>
            <p><strong>Ages 10–14:</strong> ${data.age10_14.total} (M: ${
            data.age10_14.male
          }, F: ${data.age10_14.female})</p>
            <p><strong>Ages 15–19:</strong> ${data.age15_19.total} (M: ${
            data.age15_19.male
          }, F: ${data.age15_19.female})</p>
            <p><strong>DYS Commitments:</strong></p>
            <ul>
              ${Object.entries(data.Commits)
                .map(([yr, val]) => `<li>${yr}: ${val}</li>`)
                .join("")}
            </ul>
            <p><strong>Per 1k Youth:</strong> ${(rate * 1000).toFixed(2)}</p>
          `);
        });
    });

    console.log("✅ Map rendered with interactive county data");

    const districtBtnContainer = document.getElementById("district-buttons");

    uniqueDistricts.forEach((district) => {
      const btn = document.createElement("button");
      btn.textContent = district;
      btn.addEventListener("click", () => highlightDistrict(district));
      districtBtnContainer.appendChild(btn);
    });

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset";
    resetBtn.addEventListener("click", () => {
      highlightDistrict(null);
      updateStatsBar(null);
      location.reload();
    });
    districtBtnContainer.prepend(resetBtn);

    document.getElementById("district-buttons").prepend(resetBtn);
  });
