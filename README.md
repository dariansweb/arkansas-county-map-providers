# Arkansas County Map – Community-Based Provider Youth Services Dashboard

This project maps **juvenile justice and youth service data** across all 75 Arkansas counties, integrating public datasets with interactive D3.js visualizations to support **Community-Based Providers (CBPs)**, policymakers, and the general public.

> **🔗 Live Dashboard:**  
> 👉 [CBP & Youth Services Map](https://dariansweb.github.io/arkansas-county-map-providers)

---

## 💡 What This Project Does

This dashboard visualizes:

- **Youth service delivery rates** across the state (2020–2024)
- **Community-Based Provider coverage regions**
- **Youth population by county**
- Historical **service trends** per CBP

It helps identify:

- Underserved youth populations
- Provider regions with low service rates per 1,000 youth
- Regional disparities in service distribution

Each county polygon is interactive, and each CBP has a dedicated summary card featuring trendlines and service-per-youth analytics.

---

## 🎯 Why It Matters (for CBPs & Youth Services)

CBPs are assigned large multi-county regions. However, service data is often reported **at the regional level**, not per individual county. This project:

- Bridges the data gap between **youth population density** and **services delivered**
- Allows CBPs to **self-audit** coverage gaps
- Helps DHS and state leadership **target funding, staffing, and programs** based on true need

By displaying service rates **relative to the population of youth aged 10–19**, this dashboard paints a clearer picture of where support is strong—and where it's still needed.

---

## 📦 File Contents

- `data/Arkansas_CBP_Analysis_2020-2024.pdf`  
  Comprehensive analysis report of Community-Based Provider services from 2020 to 2024.&#8203;:contentReference[oaicite:2]{index=2}

- `COUNTY_BOUNDARY.svg`  
  :contentReference[oaicite:3]{index=3}&#8203;:contentReference[oaicite:4]{index=4}

- `countyData.js`  
  :contentReference[oaicite:5]{index=5}&#8203;:contentReference[oaicite:6]{index=6}

- `providers-intake-data.js`  
  :contentReference[oaicite:7]{index=7}&#8203;:contentReference[oaicite:8]{index=8}

- `provider-coverage.json`  
  :contentReference[oaicite:9]{index=9}&#8203;:contentReference[oaicite:10]{index=10}

- `cbp-region-summary.json`  
  :contentReference[oaicite:11]{index=11}&#8203;:contentReference[oaicite:12]{index=12}

- `cbp-sparklines.json`  
  :contentReference[oaicite:13]{index=13}&#8203;:contentReference[oaicite:14]{index=14}

--- 

## 🧭 Data Sources

### 🗺️ County Boundaries

[Arkansas GIS Office – County Boundary Polygons](https://gis.arkansas.gov/product/county-boundary-polygons/)

### 👥 Population Data

[U.S. Census Bureau – County Population Totals (2020–2024)](https://www.census.gov/data/tables/time-series/demo/popest/2020s-counties-total.html)

### 📊 Juvenile Commitment Data

[Arkansas DHS Division of Youth Services – Reports & Publications](https://humanservices.arkansas.gov/divisions-shared-services/youth-services/reports-publications/)

---

## 🌐 Example: Load the Map in D3

```javascript
d3.xml("COUNTY_BOUNDARY.svg").then((svg) => {
  document.getElementById("map-container").appendChild(svg.documentElement);
});
