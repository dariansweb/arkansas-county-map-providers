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
        fetch("data/cbp-sparklines.json")
        .then(res => res.json())
        .then(sparklines => {
          Object.entries(sparklines).forEach(([provider, data]) => {
            const card = [...document.querySelectorAll(".cbp-card")]
              .find(c => c.querySelector("h3")?.textContent === provider);
            
            if (!card) return;
      
            const sparkDiv = document.createElement("div");
            sparkDiv.className = "sparkline";
            card.appendChild(sparkDiv);
      
            drawSparkline(sparkDiv, data);
          });
        });

      });
  });
  
  function drawSparkline(container, data) {
    const width = 200;
    const height = 40;
    const margin = { top: 4, right: 4, bottom: 4, left: 4 };
  
    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([margin.left, width - margin.right]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.services)]).nice()
      .range([height - margin.bottom, margin.top]);
  
    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.services))
      .curve(d3.curveMonotoneX);
  
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#1976d2")
      .attr("stroke-width", 2)
      .attr("d", line);
  
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.services))
      .attr("r", 2)
      .attr("fill", "#1976d2");
  }
  