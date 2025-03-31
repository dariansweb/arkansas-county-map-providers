Arkansas County Map – Community-Based Provider Youth Services Dashboard
This project maps juvenile justice and youth service data across all 75 Arkansas counties, integrating public datasets with interactive D3.js visualizations to support Community-Based Providers (CBPs), policymakers, and the general public.

🔗 Live Dashboard:
👉 CBP & Youth Services Map

💡 What This Project Does
This dashboard visualizes:

Youth service delivery rates across the state (2020–2024)

Community-Based Provider coverage regions

Youth population by county

Historical service trends per CBP

It helps identify:

Underserved youth populations

Provider regions with low service rates per 1,000 youth

Regional disparities in service distribution

Each county polygon is interactive, and each CBP has a dedicated summary card featuring trendlines and service-per-youth analytics.

🎯 Why It Matters (for CBPs & Youth Services)
CBPs are assigned large multi-county regions. However, service data is often reported at the regional level, not per individual county. This project:

Bridges the data gap between youth population density and services delivered

Allows CBPs to self-audit coverage gaps

Helps DHS and state leadership target funding, staffing, and programs based on true need

By displaying service rates relative to the population of youth aged 10–19, this dashboard paints a clearer picture of where support is strong—and where it's still needed.

📦 File Contents
COUNTY_BOUNDARY.svg
Simplified vector county map used for rendering D3 polygons

countyData.js
Average population, male/female counts, and youth age groups per county

providers-intake-data.js
Service totals by CBP from 2020 to 2024

provider-coverage.json
County-to-provider mapping used in map overlays

cbp-region-summary.json
Region-wide service and youth stats by CBP

cbp-sparklines.json
5-year service totals for generating mini trendlines in each CBP card

🧭 Data Sources
🗺️ County Boundaries
Arkansas GIS Office – County Boundary Polygons

👥 Population Data
U.S. Census Bureau – County Population Totals (2020–2024)

📊 Juvenile Commitment Data
Arkansas DHS Division of Youth Services – Reports & Publications

🌐 Example: Load the Map in D3
js
Copy
Edit
d3.xml("COUNTY_BOUNDARY.svg").then((svg) => {
  document.getElementById("map-container").appendChild(svg.documentElement);
});
🚀 Use Cases
Case management dashboards

Interactive GIS mapping

Service planning and resource allocation

Education, research, and public transparency

📝 License
MIT License
Copyright © 2025
Darian Sims

You are free to use, modify, and remix this project with attribution. See LICENSE.txt for more details.

🤝 Contributions Welcome
Got improvements? Want to add charts, filters, or integrate real-time data?
Pull requests and forks are always welcome.

This is a living project designed to grow with the needs of Arkansas communities. 💙
