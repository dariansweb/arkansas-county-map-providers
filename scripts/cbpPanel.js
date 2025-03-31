// scripts/cbpPanel.js

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/cbp-region-summary.json")
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById("cbp-panel-container");
  
        data.forEach(cbp => {
          const card = document.createElement("div");
          card.className = "cbp-card";
  
          const countyBadges = cbp.counties_served.map(
            county => `<span class="badge">${county}</span>`
          ).join(" ");
          
          card.innerHTML = `
            <h3>${cbp.provider}</h3>
            <ul>
              <li><strong>Counties Served:</strong> ${cbp.counties_count}</li>
              <li><strong>Youth Population:</strong> ${cbp.youth_population.toLocaleString()}</li>
              <li><strong>Avg Services (2020–2024):</strong> ${cbp.avg_services}</li>
              <li><strong>Per 1k Youth:</strong> ${cbp.services_per_1000_youth}</li>
            </ul>
            <div class="badge-container">${countyBadges}</div>
          `;
          
  
          container.appendChild(card);
        });
      });
  });
  