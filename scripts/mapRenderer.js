// scripts/mapRenderer.js

// Wait for DOM content to load
document.addEventListener("DOMContentLoaded", function () {
  const width = 960;
  const height = 600;

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("padding", "10px")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px");

  // Load and render the SVG map
  d3.xml("../data/COUNTY_BOUNDARY.svg").then((xml) => {
    const svgNode = xml.documentElement;
    document.body.appendChild(svgNode);

    const svg = d3.select("svg");
    svg.attr("width", width).attr("height", height);

    // Load the processed county data
    d3.json("../data/processed-counties.json").then((countyData) => {
      const dataMap = {};
      countyData.forEach(d => {
        dataMap[d.county] = d;
      });

      // Create a color scale
      const color = d3.scaleSequential()
        .interpolator(d3.interpolateOranges)
        .domain([0, d3.max(countyData, d => d.services_per_1000_youth)]);

      // Apply data to counties
      svg.selectAll("path")
        .each(function () {
          const countyPath = d3.select(this);
          const name = countyPath.attr("name");

          if (name && dataMap[name]) {
            const d = dataMap[name];
            countyPath
              .style("fill", color(d.services_per_1000_youth))
              .on("mouseover", function (event) {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`
                  <strong>${name} County</strong><br/>
                  Pop: ${d.population.toLocaleString()}<br/>
                  Youth: ${d.youth_population.toLocaleString()}<br/>
                  Avg Services: ${d.avg_services.toFixed(1)}<br/>
                  Per 1k Youth: ${d.services_per_1000_youth.toFixed(2)}
                `).style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");
              })
              .on("mouseout", function () {
                tooltip.transition().duration(500).style("opacity", 0);
              });
          } else {
            countyPath.style("fill", "#eee");
          }
        });
    });
  });
});
