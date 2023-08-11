# Spatial Correlation Analysis System Between Crop Cultivation And Hotspot Occurrences Using Satellite Technology And Geospatial Data

> Internship project for GISTDA Internship on June 1, 2023 – August 10, 2023

![Preview 1](https://i.imgur.com/On5wGUO.png)
![Preview 2](https://i.imgur.com/MSvVbtA.png)

## Overview

The **Spatial Correlation Analysis System Between Crop Cultivation And Hotspot Occurrences Using Satellite Technology And Geospatial Data** is a web-based platform designed to analyze and visualize the spatial relationship between crop cultivation and hotspot occurrences using satellite technology and geospatial data. This project leverages the [GISTDA Sphere API](https://sphere.gistda.or.th/) and provides an intuitive interface for users to explore and gain insights into the patterns and correlations between crop types, cultivation practices, and the emergence of hotspots, thereby aiding in proactive disaster management and informed decision-making.

The project is currently hosted at **<https://opendata.gistda.or.th/dulapahv/>**. You can also access it through my .dev domain at **<https://dulapahv.dev/gistda>**.

## Background

In Thailand, a common yet detrimental practice among farmers involves burning crops after harvesting. This cost and time-saving approach, however, has led to adverse consequences such as the creation of hotspots instead of the proper burial of soil. As a result, widespread fires and air pollution have become pervasive issues.

Satellites equipped with capabilities beyond visible light, such as infrared, multispectral, and hyperspectral imaging, play a crucial role in addressing this challenge. These advanced imaging techniques enable satellites to discern various aspects, including crop types (such as rice, maize, sugarcane, and cassava), crop ages, and the types of hotspots present.

Leveraging satellite-derived data allows us to predict areas, dates, and crop types that are prone to experiencing high concentrations of hotspots. This foresight empowers the government to proactively devise preventive and mitigative strategies before fires occur, effectively curbing the escalation of extensive fires and air pollution. Furthermore, this data also furnishes valuable insights to residents regarding the susceptibility of their chosen locations or settlements to air pollution and fire hazards stemming from crop burning.

In essence, the utilization of satellite data presents a comprehensive and proactive approach towards tackling the issue of crop burning-induced fires and air pollution. This data-driven strategy not only aids in averting potential disasters but also contributes to informed decision-making for both governmental authorities and individuals residing in vulnerable areas.

## Features

- **Hotspot Occurrences:** Visualize hotspot occurrences on the map for any selected day, including six types of hotspots.
- **Crop Cultivation Data:** Display crop types and their ages on the map every fortnight, covering four types of crops.
- **Summary Table:** View a table summarizing hotspot occurrences, including the number of occurrences, locations, and timestamps.
- **Crop and Hotspot Analysis:**
  - Analyze the relationship between hotspots and land usage, including hotspot distribution across different areas.
  - Explore a 15-day hotspot history and observe linear regression trends over the past 15 days.
  - Examine the geographical distribution of each crop type and their percentages within specific areas.
  - Access information about crop ages and the irrigation office area.
  - Identify dates with potentially high heat concentration in each crop area.
- **Two Analysis Modes:** Choose between two modes of analysis: a dropdown selection or free-form multipolygon drawing directly on the map.
- **Multi-Area Analysis:** Combine and uncombine multipolygons to analyze multiple areas simultaneously.
- **Draggable Multipolygons:** Easily drag multipolygons across the map to maintain consistent areas and shapes for analysis in different regions.

## Technologies Used

### Programming Languages

- HTML
- CSS
- JavaScript
- Python
- SQL

### Frontend Development

- React.js
- Tailwind CSS
- Axios
- Mapbox and Maplibre GL JS
- Material UI
- DaisyUI
- VSCode

### Backend Development

- Node.js
- Psycopg2

### Database Management

- DataGrip
- PostgreSQL

### Design and Internationalization

- Figma
- react.i18next
- Turf.js
- Chart.js
- QGIS and PostGIS

## Screenshots

### Overview Page

![Overview Page](https://i.imgur.com/KtYi1v3.png)

### Analysis Page

![Analysis Page](https://i.imgur.com/lmcooLe.png)

### Expanded Analysis Page

![Expanded Analysis Page](https://i.imgur.com/Bpbwqfm.png)

## License

This project is licensed under the [MIT License](https://github.com/dulapahv/Gistda-Internship/blob/main/LICENSE).

## Acknowledgements

I want to extend my heartfelt appreciation to Ms. Donlaphon Pimpichai, my internship supervisor, for her invaluable guidance and continuous support throughout the internship. I would also like to express my gratitude to my friend, Mr. Peerasawat Yapira, for generously assisting me in integrating the GISTDA map into the website.
