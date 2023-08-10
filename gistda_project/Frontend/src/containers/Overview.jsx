import React, { useEffect, useState } from 'react';

import axios from 'axios';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import * as turf from '@turf/turf';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import FormLabel from '@mui/material/FormLabel';
import Accordion from '@mui/material/Accordion';
import InputLabel from '@mui/material/InputLabel';
import ClearIcon from '@mui/icons-material/Clear';
import FormControl from '@mui/material/FormControl';
import SearchIcon from '@mui/icons-material/Search';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import BorderAllIcon from '@mui/icons-material/BorderAll';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BorderClearIcon from '@mui/icons-material/BorderClear';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import apList from './amphoe.json';
import tbList from './tambon.json';
import pvList from './province.json';
import { map, sphere } from '../components';
import { TableOverview } from '../components';

const baseURL = 'https://opendata.gistda.or.th/dulapahv/api/';

const riceAgeColor = [
  '#0d3353',
  '#19516e',
  '#276f89',
  '#358da5',
  '#42abbe',
  '#50c9d9',
  '#6ed2e2',
  '#8cdbeb',
];
const maizeAgeColor = [
  '#85552f',
  '#a3743c',
  '#c1924a',
  '#e0b05a',
  '#ffd26b',
  '#f6d268',
  '#eeda66',
  '#e6e265',
];
const sugarcaneAgeColor = [
  '#0f0903',
  '#231107',
  '#36130c',
  '#4a1e0f',
  '#5e2a11',
  '#723715',
  '#87421b',
  '#9c4e23',
  '#b15b2c',
  '#c86737',
  '#df7544',
  '#f38451',
  '#ff9360',
  '#ffa171',
  '#ffb183',
  '#ffbf95',
  '#ffdca9',
  '#ffe9bd',
  '#fff4d1',
  '#ffefd2',
  '#ffead3',
  '#ffe6d4',
  '#ffe1d5',
  '#ffddd6',
];
const cassavaAgeColor = [
  '#070001',
  '#190002',
  '#2c0003',
  '#3f0004',
  '#520006',
  '#640017',
  '#770019',
  '#89001b',
  '#9c001d',
  '#ae001f',
  '#c10021',
  '#d4002d',
  '#e71f3a',
  '#f43a49',
  '#ff5461',
  '#ff6e77',
  '#ff889d',
  '#ff8da8',
  '#ff92b3',
  '#ff97be',
  '#ffa2ce',
  '#ffaedf',
  '#ffb9ef',
  '#ffc4ff',
];

const buttonTheme = createTheme({
  palette: {
    mode: localStorage.getItem('theme'),
    primary: {
      main: '#F390B0',
      dark: '#FF99BA',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#bd718a',
      dark: '#c97e97',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
    fontSize: 16,
  },
});

const CheckBoxTheme = createTheme({
  palette: {
    mode: localStorage.getItem('theme'),
    primary: {
      main: '#F390B0',
    },
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
  },
});

const datePickerTheme = createTheme({
  palette: {
    mode: localStorage.getItem('theme'),
    primary: {
      main: '#F390B0',
    },
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
  },
});

const skeletonTheme = createTheme({
  palette: {
    mode: localStorage.getItem('theme'),
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
  },
});

const selectTheme = createTheme({
  palette: {
    mode: localStorage.getItem('theme'),
    primary: {
      main: '#F390B0',
    },
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
  },
});

const accordianTheme = createTheme({
  palette: {
    mode: localStorage.getItem('theme'),
    primary: {
      main: '#F390B0',
    },
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
  },
});

const luColor = {
  rice: '#56c0c0',
  maize: '#fbce5c',
  sugarcane: '#fba046',
  otherCrop: '#fb6584',
  forest: '#9c63fd',
  other: '#48a1e9',
};

const getFillColorExpression = (colors, start, end) => {
  const expression = ['match', ['get', 'legend']];
  for (let i = start, j = 0; i <= end; i++, j++) {
    expression.push(i);
    expression.push(colors[j]);
  }
  expression.push('#000');
  return expression;
};

let month;
let lastDate;
let tempDateCrop;
let currentDate;

export const getMonth = () => month;
export const getLastCropDate = () => lastDate;
export const getLastDateCrop = () => tempDateCrop;
export const getDate = () => currentDate;

let layer_rice;
let layer_maize;
let layer_sugarcane;
let layer_cassava;

export default function DetailHotspot() {
  const { t, i18n } = useTranslation();
  const [boundary, setBoundary] = useState(false);
  const [pm25, setPm25] = useState(false);
  const [isHotspotLoaded, setIsHotspotLoaded] = useState(false);
  const [date, setDate] = React.useState(dayjs('2023-03-06'));
  const [hotspotData, setHotspotData] = useState();
  const [isHotspotShowed, setIsHotspotShowed] = useState(true);
  const [isRiceLoaded, setIsRiceLoaded] = useState(true);
  const [isMaizeLoaded, setIsMaizeLoaded] = useState(true);
  const [isSugarcaneLoaded, setIsSugarcaneLoaded] = useState(true);
  const [isOtherCropLoaded, setIsOtherCropLoaded] = useState(true);
  const [isForestLoaded, setIsForestLoaded] = useState(true);
  const [isOtherLoaded, setIsOtherLoaded] = useState(true);
  const [province, setProvince] = useState(10);
  const [district, setDistrict] = useState(0);
  const [subDistrict, setSubDistrict] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [riceData, setRiceData] = useState();
  const [maizeData, setMaizeData] = useState();
  const [sugarcaneData, setSugarcaneData] = useState();
  const [cassavaData, setCassavaData] = useState();
  const [coordinates, setCoordinates] = useState();
  const [isDataExist, setIsDataExist] = useState(true);

  currentDate = date;

  const fetchData = async ({ query, setData, type }) => {
    switch (type) {
      case 2:
        setIsHotspotLoaded(false);
        break;
      default:
        break;
    }
    axios
      .get(`${baseURL}?${query}`)
      .then(function (response) {
        setData(response.data);
        setIsDataExist(true);
        switch (type) {
          case 2:
            setIsHotspotLoaded(true);
            break;
          default:
            break;
        }
      })
      .catch(function (error) {
        console.log(error);
        if (error.response && error.response.status === 500) {
          setIsDataExist(false);
        }
      });
  };

  let layer_pm25;
  let layer_pvBorder;

  layer_pm25 = new sphere.Layer('0', {
    type: sphere.LayerType.WMS,
    url: 'https://gistdaportal.gistda.or.th/data/services/pm_check/pm25_hourly_raster/MapServer/WMSServer',
    zIndex: 5,
    opacity: 0.8,
    id: 'layer_pm25',
  });

  layer_pvBorder = new sphere.Layer('0', {
    type: sphere.LayerType.WMS,
    url: 'https://gistdaportal.gistda.or.th/data2/services/L05_Province_GISTDA_50k_nonlabel/MapServer/WMSServer',
    zIndex: 6,
    opacity: 1,
    id: 'layer_pvBorder',
  });

  if (pm25) {
    map?.Layers.add(layer_pm25);
  } else {
    map?.Layers.list().forEach((layer) => {
      if (layer.id === 'layer_pm25') {
        map?.Layers.remove(layer_pm25);
        return;
      }
    });
  }
  if (boundary) {
    map?.Layers.add(layer_pvBorder);
  } else {
    map?.Layers.list().forEach((layer) => {
      if (layer.id === 'layer_pvBorder') {
        map?.Layers.remove(layer_pvBorder);
        return;
      }
    });
  }

  useEffect(() => {
    month = date.format('MM');
    lastDate =
      parseInt(date.format('DD')) < 16
        ? '15'
        : date.endOf('month').format('DD');
    tempDateCrop = date.format('YYYY-MM') + '-' + lastDate;
  }, [date]);

  useEffect(() => {
    const month = date.format('MM');
    const hotspotQuery = `data=hotspot_2023${month}&select=latitude,longitude,lu_hp,pv_tn,ap_tn,pv_en,ap_en,pv_idn,th_time&where=acq_date='${date.format(
      'DD-MM-YY'
    )}'`;

    fetchData({
      query: hotspotQuery,
      setData: setHotspotData,
      type: 2,
    });
  }, [date]);

  useEffect(() => {
    if (!hotspotData) return;
    let layer_hotspot = new sphere.Layer({
      sources: {
        hotspot_overview_src: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: Array.from(hotspotData.result, (hotspot) => {
              return {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [
                    parseFloat(hotspot.longitude),
                    parseFloat(hotspot.latitude),
                  ],
                },
                properties: {
                  lu_hp: hotspot.lu_hp,
                },
              };
            }).filter((hotspot) => {
              if (isRiceLoaded && hotspot.properties.lu_hp === 'A101')
                return true;
              if (isMaizeLoaded && hotspot.properties.lu_hp === 'A202')
                return true;
              if (isSugarcaneLoaded && hotspot.properties.lu_hp === 'A203')
                return true;
              if (isOtherCropLoaded && hotspot.properties.lu_hp === 'A999')
                return true;
              if (isForestLoaded && hotspot.properties.lu_hp === 'F000')
                return true;
              if (isOtherLoaded && hotspot.properties.lu_hp === 'O000')
                return true;
              return false;
            }),
          },
        },
      },
      layers: [
        {
          id: 'layer_hotspot_heat_overview',
          type: 'heatmap',
          source: 'hotspot_overview_src',
          maxzoom: 10,
          zIndex: 6,
          paint: {
            // Increase the heatmap weight based on frequency and property magnitude
            // 7,1,9,0 = if zoom is 7 or less, use 1 as heatmap-opacity, if zoom is 9 or greater, use 0, and interpolate linearly in between
            // 'heatmap-weight': [
            //   'interpolate',
            //   ['linear'],
            //   ['get', 'lu_hp'],
            //   0,
            //   0,
            //   6,
            //   1,
            // ],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5,
              1,
              10,
              4,
            ],
            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Begin color ramp at 0-stop with a 0-transparancy color
            // to create a blur-like effect.
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(33,102,172,0)',
              0.2,
              'rgb(103,169,207)',
              0.4,
              'rgb(209,229,240)',
              0.6,
              'rgb(253,219,199)',
              0.8,
              'rgb(239,138,98)',
              1,
              'rgb(178,24,43)',
            ],
            // Adjust the heatmap radius by zoom level
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              1,
              6,
              23,
            ],
            // Transition from heatmap to circle layer by zoom level
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8.5,
              1,
              10,
              0,
            ],
          },
        },
        {
          id: 'layer_hotspot_point_overview',
          type: 'circle',
          source: 'hotspot_overview_src',
          minzoom: 8,
          zIndex: 6,
          paint: {
            // Size circle radius by earthquake magnitude and zoom level
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8,
              1,
              22,
              100,
            ],
            // Color circle by lu_hp
            'circle-color': [
              'match',
              ['get', 'lu_hp'],
              'A101',
              luColor.rice,
              'A202',
              luColor.maize,
              'A203',
              luColor.sugarcane,
              'A999',
              luColor.otherCrop,
              'F000',
              luColor.forest,
              'O000',
              luColor.other,
              '#000',
            ],
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 1, // 2
            // Transition from heatmap to circle layer by zoom level
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8,
              0,
              8.5,
              0.75,
            ],
          },
        },
      ],
    });
    const layers = map.Layers.list();
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (
        layer.id === 'layer_hotspot_heat_overview' ||
        layer.id === 'layer_hotspot_point_overview'
      ) {
        map.Layers.remove(layer_hotspot);
        break;
      }
    }
    map.Layers.add(layer_hotspot);
  }, [
    hotspotData,
    isRiceLoaded,
    isMaizeLoaded,
    isSugarcaneLoaded,
    isOtherCropLoaded,
    isForestLoaded,
    isOtherLoaded,
  ]);

  const columns = [
    {
      width: 120,
      label: t('province'),
      dataKey: 'province',
      align: 'left',
    },
    {
      width: 130,
      label: t('hotspot'),
      dataKey: 'hotspot',
    },
    {
      width: 100,
      label: t('district'),
      dataKey: 'district',
      renderButton: true,
    },
    {
      width: 110,
      label: t('time'),
      dataKey: 'time',
    },
  ];

  function createData(id, province, district, hotspot, time, date) {
    return {
      id,
      province,
      district,
      hotspot: 1,
      time,
      date,
    };
  }

  const rowsMap = new Map();

  if (hotspotData) {
    hotspotData.result.forEach((item) => {
      const key = item.pv_en;
      const hour = item.th_time.toString().slice(0, 2).padStart(2, '0');
      const minute = item.th_time.toString().slice(2, 4).padStart(2, '0');
      const formattedTime = `${hour}:${minute}`;
      if (rowsMap.has(key)) {
        rowsMap.get(key).hotspot++;
      } else {
        rowsMap.set(
          key,
          createData(
            item.pv_idn,
            `${i18n.language === 'th' ? item.pv_tn : item.pv_en}`,
            `${i18n.language === 'th' ? item.ap_tn : item.ap_en}`,
            1,
            formattedTime,
            date.format('DD-MM-YY')
          )
        );
      }
    });
  }

  const rows = Array.from(rowsMap.values());

  useEffect(() => {
    if (!coordinates) return;

    const points = [];

    coordinates.result.forEach((coord) => {
      const lat = parseFloat(coord.lat);
      const lon = parseFloat(coord.long);

      if (!isNaN(lat) && !isNaN(lon)) {
        const point = turf.point([lon, lat]);
        points.push(point);
      }
    });

    const geojson = turf.featureCollection(points);

    const bbox = turf.bbox(geojson);
    const newCoordinates = [
      { lat: bbox[1], lon: bbox[0] },
      { lat: bbox[3], lon: bbox[0] },
      { lat: bbox[3], lon: bbox[2] },
      { lat: bbox[1], lon: bbox[2] },
    ];

    let shape;
    if (bbox[0] === bbox[2] && bbox[1] === bbox[3]) {
      shape = new sphere.Circle(
        {
          lat: bbox[1],
          lon: bbox[0],
        },
        0.01,
        {
          fillColor: 'rgba(73, 177, 207, 0.1)',
          lineColor: 'rgba(73, 177, 207, 1)',
          lineWidth: 2,
        }
      );
    } else {
      shape = new sphere.Polygon(newCoordinates, {
        fillColor: 'rgba(73, 177, 207, 0.1)',
        lineColor: 'rgba(73, 177, 207, 1)',
        lineWidth: 2,
      });
    }

    if (points.length > 0) {
      const bbox = turf.bbox(geojson);
      const zoomTemp = {
        minLon: subDistrict !== 0 ? bbox[0] - 0.015 : bbox[0],
        minLat: subDistrict !== 0 ? bbox[1] - 0.015 : bbox[1],
        maxLon: subDistrict !== 0 ? bbox[2] + 0.015 : bbox[2],
        maxLat: subDistrict !== 0 ? bbox[3] + 0.015 : bbox[3],
      };

      const pt = district !== 0 ? 200 : 125;
      const pb = district !== 0 ? 200 : 125;
      map.Overlays.add(shape);
      map.bound(zoomTemp, { padding: { top: pt, bottom: pb } });
    } else {
      console.log('No valid coordinates found.');
    }
  }, [coordinates]);

  const handleSearchButton = () => {
    handleClearButton();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const month = getMonth();
    const lastCropDate = getLastCropDate();
    const lastDateCrop = getLastDateCrop();

    let coordQuery = '';
    let cropQueries = [];

    if (subDistrict !== 0) {
      coordQuery = `data=thai_coord&select=lat,long&where=ta_id='${subDistrict}'`;
      cropQueries = [
        `data=rice_2023${month}${lastCropDate} as b&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(b.geom)::jsonb, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${lastDateCrop}' AND t_code='${subDistrict}') AS subquery`,
        `data=maize_2023${month}${lastCropDate} as b&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(b.geom)::jsonb, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${lastDateCrop}' AND t_code='${subDistrict}') AS subquery`,
        `data=sugarcane_2023${month}${lastCropDate} as b&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(b.geom)::jsonb, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${lastDateCrop}' AND t_code='${subDistrict}') AS subquery`,
        `data=cassava_2023${month}${lastCropDate} as b&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(b.geom)::jsonb, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${lastDateCrop}' AND t_code='${subDistrict}') AS subquery`,
      ];
    } else if (district !== 0) {
      coordQuery = `data=thai_coord&select=lat,long&where=am_id='${district}'`;
      cropQueries = [
        `data=rice_2023${month}${lastCropDate} as b&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(b.geom)::jsonb, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${lastDateCrop}' AND a_code='${district}') AS subquery`,
        `data=maize_2023${month}${lastCropDate} as b&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(b.geom)::jsonb, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${lastDateCrop}' AND a_code='${district}') AS subquery`,
        `data=sugarcane_2023${month}${lastCropDate} as b&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(b.geom)::jsonb, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${lastDateCrop}' AND a_code='${district}') AS subquery`,
        `data=cassava_2023${month}${lastCropDate} as b&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(b.geom)::jsonb, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${lastDateCrop}' AND a_code='${district}') AS subquery`,
      ];
    } else {
      coordQuery = `data=thai_coord&select=lat,long&where=ch_id='${province}'`;
      cropQueries = [
        `data=rice_2023${month}${lastCropDate} as b&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(b.geom)::jsonb, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${lastDateCrop}' AND p_code='${province}') AS subquery`,
        `data=maize_2023${month}${lastCropDate} as b&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(b.geom)::jsonb, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${lastDateCrop}' AND p_code='${province}') AS subquery`,
        `data=sugarcane_2023${month}${lastCropDate} as b&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(b.geom)::jsonb, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${lastDateCrop}' AND p_code='${province}') AS subquery`,
        `data=cassava_2023${month}${lastCropDate} as b&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(b.geom)::jsonb, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${lastDateCrop}' AND p_code='${province}') AS subquery`,
      ];
    }

    fetchDataByQuery(coordQuery, setCoordinates);

    cropQueries.forEach((query, index) => {
      const setDataFunc =
        index === 0
          ? setRiceData
          : index === 1
          ? setMaizeData
          : index === 2
          ? setSugarcaneData
          : setCassavaData;
      fetchDataByQuery(query, setDataFunc);
    });
  };

  const fetchDataByQuery = (query, setData) => {
    fetchData({
      query,
      setData,
    });
  };

  const handleClearButton = () => {
    map.Overlays.clear();
    if (layer_rice) map.Layers.remove(layer_rice);
    if (layer_maize) map.Layers.remove(layer_maize);
    if (layer_sugarcane) map.Layers.remove(layer_sugarcane);
    if (layer_cassava) map.Layers.remove(layer_cassava);
    layer_rice = null;
    layer_maize = null;
    layer_sugarcane = null;
    layer_cassava = null;
    setRiceData(null);
    setMaizeData(null);
    setSugarcaneData(null);
    setCassavaData(null);
  };

  useEffect(() => {
    if (!(riceData && riceData.result[0].features)) return;
    setTimeout(() => {
      const geojson = {
        type: 'FeatureCollection',
        features: riceData.result[0].features,
      };
      let layer_crop_rice = new sphere.Layer({
        sources: {
          rice: {
            type: 'geojson',
            data: geojson,
          },
        },
        layers: [
          {
            id: 'layer_crop_rice',
            type: 'fill',
            source: 'rice',
            zIndex: 4,
            paint: {
              'fill-color': getFillColorExpression(riceAgeColor, 1, 8),
              'fill-opacity': 0.5,
            },
          },
        ],
      });
      map.Layers.add(layer_crop_rice);
      layer_rice = layer_crop_rice;
    }, 1000);
  }, [riceData]);

  useEffect(() => {
    if (!(maizeData && maizeData.result[0].features)) return;
    setTimeout(() => {
      const geojson = {
        type: 'FeatureCollection',
        features: maizeData.result[0].features,
      };
      let layer_crop_maize = new sphere.Layer({
        sources: {
          maize: {
            type: 'geojson',
            data: geojson,
          },
        },
        layers: [
          {
            id: 'layer_crop_maize',
            type: 'fill',
            source: 'maize',
            zIndex: 4,
            paint: {
              'fill-color': getFillColorExpression(maizeAgeColor, 0, 7),
              'fill-opacity': 0.5,
            },
          },
        ],
      });
      map.Layers.add(layer_crop_maize);
      layer_maize = layer_crop_maize;
    }, 1000);
  }, [maizeData]);

  useEffect(() => {
    if (!(sugarcaneData && sugarcaneData.result[0].features)) return;
    setTimeout(() => {
      const geojson = {
        type: 'FeatureCollection',
        features: sugarcaneData.result[0].features,
      };
      let layer_crop_sugarcane = new sphere.Layer({
        sources: {
          sugarcane: {
            type: 'geojson',
            data: geojson,
          },
        },
        layers: [
          {
            id: 'layer_crop_sugarcane',
            type: 'fill',
            source: 'sugarcane',
            zIndex: 4,
            paint: {
              'fill-color': getFillColorExpression(sugarcaneAgeColor, 1, 24),
              'fill-opacity': 0.5,
            },
          },
        ],
      });
      map.Layers.add(layer_crop_sugarcane);
      layer_sugarcane = layer_crop_sugarcane;
    }, 1000);
  }, [sugarcaneData]);

  useEffect(() => {
    if (!(cassavaData && cassavaData.result[0].features)) return;
    setTimeout(() => {
      const geojson = {
        type: 'FeatureCollection',
        features: cassavaData.result[0].features,
      };
      let layer_crop_cassava = new sphere.Layer({
        sources: {
          cassava: {
            type: 'geojson',
            data: geojson,
          },
        },
        layers: [
          {
            id: 'layer_crop_cassava',
            type: 'fill',
            source: 'cassava',
            zIndex: 4,
            paint: {
              'fill-color': getFillColorExpression(cassavaAgeColor, 1, 24),
              'fill-opacity': 0.5,
            },
          },
        ],
      });
      map.Layers.add(layer_crop_cassava);
      layer_cassava = layer_crop_cassava;
    }, 1000);
  }, [cassavaData]);

  return (
    <div className='flex flex-col space-y-4 h-fit'>
      <div className='grid gap-4 sm:grid-cols-1 md:grid-cols-3 content-center'>
        <ThemeProvider theme={buttonTheme}>
          <Button
            variant='contained'
            className='h-full w-full min-h-50 !capitalize'
            startIcon={boundary ? <BorderAllIcon /> : <BorderClearIcon />}
            onClick={() => setBoundary(!boundary)}
            color={boundary ? 'primary' : 'secondary'}
          >
            {boundary ? t('showProvinceBoundary') : t('hideProvinceBoundary')}
          </Button>
          <Button
            variant='contained'
            className='h-full w-full min-h-50 !capitalize'
            startIcon={pm25 ? <CloudQueueIcon /> : <CloudOffIcon />}
            onClick={() => setPm25(!pm25)}
            color={pm25 ? 'primary' : 'secondary'}
          >
            {pm25 ? t('showPm25') : t('hidePm25')}
          </Button>
        </ThemeProvider>
        <div className='grid content-center'>
          <ThemeProvider theme={datePickerTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t('date')}
                value={date}
                onChange={(newValue) => {
                  setDate(newValue);
                }}
                format='DD/MM/YYYY'
              />
            </LocalizationProvider>
          </ThemeProvider>
        </div>
      </div>
      {isDataExist ? (
        <>
          <div className='flex flex-col bg-white dark:bg-[#2c2c2c] rounded-lg px-4 py-2 drop-shadow-md'>
            <form className='flex flex-col space-y-4 my-2'>
              <FormLabel>
                <h1 className='font-kanit text-[#212121] dark:text-white text-lg'>
                  {t('showCropType')}
                </h1>
              </FormLabel>
              <ThemeProvider theme={selectTheme}>
                <FormControl fullWidth variant='filled' required>
                  <InputLabel>{t('province')}</InputLabel>
                  <Select
                    id='province'
                    value={province}
                    label={t('province')}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      setDistrict(0);
                      setSubDistrict(0);
                    }}
                    disabled={isLoading}
                  >
                    {pvList.map((province) => (
                      <MenuItem key={province.ch_id} value={province.ch_id}>
                        {i18n.language === 'th'
                          ? province.changwat_t?.replace('จ.', '')
                          : province.changwat_e}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth variant='filled'>
                  <InputLabel>{t('district')}</InputLabel>
                  <Select
                    id='district'
                    value={district}
                    label={t('district')}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setSubDistrict(0);
                    }}
                    disabled={isLoading}
                  >
                    <MenuItem key={0} value={0}>
                      {t('all')}
                    </MenuItem>
                    {apList.map(
                      (district) =>
                        Number(String(district.am_id).substring(0, 2)) ===
                          province && (
                          <MenuItem key={district.am_id} value={district.am_id}>
                            {i18n.language === 'th'
                              ? district.amphoe_t
                                  ?.replace('อ.', '')
                                  ?.replace('เขต', '')
                              : district.amphoe_e}
                          </MenuItem>
                        )
                    )}
                  </Select>
                </FormControl>
                <FormControl fullWidth variant='filled'>
                  <InputLabel id='demo-simple-select-label'>
                    {t('subDistrict')}
                  </InputLabel>
                  <Select
                    id='subDistrict'
                    value={subDistrict}
                    label={t('subDistrict')}
                    onChange={(e) => {
                      setSubDistrict(e.target.value);
                    }}
                    disabled={!district || isLoading}
                  >
                    <MenuItem key={0} value={0}>
                      {t('all')}
                    </MenuItem>
                    {tbList.map(
                      (subDistrict) =>
                        Number(String(subDistrict.ta_id).substring(0, 4)) ===
                          district && (
                          <MenuItem
                            key={subDistrict.ta_id}
                            value={subDistrict.ta_id}
                          >
                            {i18n.language === 'th'
                              ? subDistrict.tambon_t
                                  ?.replace('ต.', '')
                                  ?.replace('แขวง', '')
                              : subDistrict.tambon_e}
                          </MenuItem>
                        )
                    )}
                  </Select>
                </FormControl>
              </ThemeProvider>
              <ThemeProvider theme={accordianTheme}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel1a-content'
                    id='panel1a-header'
                    className='font-kanit'
                  >
                    {t('showHideLegend')}
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className='flex flex-col gap-2'>
                      <div className='flex gap-4 items-center'>
                        <div className='grow bg-gradient-to-r from-[#0d3353] via-[#42abbe] to-[#8cdbeb] h-8 rounded-full text-center font-kanit flex flex-row items-center px-4'>
                          <p>{t('almostHarvest')}</p>
                          <p className='grow font-bold'>{t('crop.rice')}</p>
                          <p>{t('justPlanted')}</p>
                        </div>
                      </div>
                      <div className='grow bg-gradient-to-r from-[#85552f] via-[#ffd26b] to-[#e6e265] h-8 rounded-full text-center font-kanit flex flex-row items-center px-4'>
                        <p>{t('almostHarvest')}</p>
                        <p className='grow font-bold'>{t('crop.maize')}</p>
                        <p>{t('justPlanted')}</p>
                      </div>
                      <div className='grow bg-gradient-to-r from-[#0f0903] via-[#f38451] to-[#ffddd6] h-8 rounded-full text-center font-kanit flex flex-row items-center px-4'>
                        <p>{t('almostHarvest')}</p>
                        <p className='grow font-bold'>{t('crop.sugarcane')}</p>
                        <p>{t('justPlanted')}</p>
                      </div>
                      <div className='grow bg-gradient-to-r from-[#070001] via-[#e71f3a] to-[#ffc4ff] h-8 rounded-full text-center font-kanit flex flex-row items-center px-4'>
                        <p>{t('almostHarvest')}</p>
                        <p className='grow font-bold'>{t('crop.cassava')}</p>
                        <p>{t('justPlanted')}</p>
                      </div>
                    </div>
                  </AccordionDetails>
                </Accordion>
              </ThemeProvider>
              <ThemeProvider theme={buttonTheme}>
                <div className='flex gap-4'>
                  <div className='relative'>
                    <Button
                      variant='outlined'
                      color='error'
                      startIcon={<ClearIcon />}
                      size='large'
                      onClick={handleClearButton}
                      className='w-full z-10'
                      disabled={
                        isLoading ||
                        !riceData ||
                        !maizeData ||
                        !sugarcaneData ||
                        !cassavaData
                      }
                    >
                      {t('clear')}
                    </Button>
                  </div>
                  <div className='relative w-full'>
                    <Button
                      variant='contained'
                      startIcon={<SearchIcon />}
                      size='large'
                      onClick={handleSearchButton}
                      className='w-full z-10'
                      disabled={isLoading}
                    >
                      {isLoading ? t('exploring') : t('explore')}
                    </Button>
                    <div className='absolute top-0 left-0 flex items-center justify-center w-full h-full'>
                      {isLoading && (
                        <span className='loading loading-infinity w-12 text-[#f390b0]'></span>
                      )}
                    </div>
                  </div>
                </div>
              </ThemeProvider>
            </form>
          </div>
          <div className=' bg-white dark:bg-[#2c2c2c] rounded-lg px-4 py-2 gap-y-2 drop-shadow-md'>
            <ThemeProvider theme={CheckBoxTheme}>
              <FormLabel>
                <div className='flex items-center'>
                  <Checkbox
                    disabled={!isHotspotLoaded}
                    id='hotspot-checkbox'
                    indeterminate={
                      isRiceLoaded === isMaizeLoaded &&
                      isMaizeLoaded === isSugarcaneLoaded &&
                      isSugarcaneLoaded === isOtherCropLoaded &&
                      isOtherCropLoaded === isForestLoaded &&
                      isForestLoaded === isOtherLoaded
                        ? false
                        : true
                    }
                    onChange={() => {
                      setIsHotspotShowed(!isHotspotShowed);
                      setIsRiceLoaded(!isHotspotShowed);
                      setIsMaizeLoaded(!isHotspotShowed);
                      setIsSugarcaneLoaded(!isHotspotShowed);
                      setIsOtherCropLoaded(!isHotspotShowed);
                      setIsForestLoaded(!isHotspotShowed);
                      setIsOtherLoaded(!isHotspotShowed);
                    }}
                    checked={
                      isRiceLoaded &&
                      isMaizeLoaded &&
                      isSugarcaneLoaded &&
                      isOtherCropLoaded &&
                      isForestLoaded &&
                      isOtherLoaded
                    }
                  />
                  <h1 className='text-[#212121] dark:text-white text-lg'>
                    {t('showHotspotInLandType')}
                  </h1>
                </div>
              </FormLabel>
              <div className='grid grid-cols-2 sm:grid-cols-3 '>
                <div className='flex flex-row items-center'>
                  <div>
                    <Checkbox
                      disabled={!isHotspotLoaded}
                      onChange={() => {
                        setIsRiceLoaded(!isRiceLoaded);
                        setIsHotspotShowed(false);
                      }}
                      checked={isRiceLoaded}
                    />
                  </div>
                  <div className='flex flex-row items-center space-x-2'>
                    <div>
                      <div className='bg-[#fb6584] rounded-full w-5 h-5'></div>
                    </div>
                    <div className='font-kanit text-[#212121] dark:text-white'>{`${t(
                      'landUse.นาข้าว'
                    )}`}</div>
                  </div>
                </div>
                <div className='flex flex-row items-center'>
                  <div>
                    <Checkbox
                      disabled={!isHotspotLoaded}
                      onChange={() => {
                        setIsMaizeLoaded(!isMaizeLoaded);
                        setIsHotspotShowed(false);
                      }}
                      checked={isMaizeLoaded}
                    />
                  </div>
                  <div className='flex flex-row items-center space-x-2'>
                    <div>
                      <div className='bg-[#48a1e9] rounded-full w-5 h-5'></div>
                    </div>
                    <div className='font-kanit text-[#212121] dark:text-white'>{`${t(
                      'landUse.ข้าวโพดและไร่หมุนเวียน'
                    )}`}</div>
                  </div>
                </div>
                <div className='flex flex-row items-center'>
                  <div>
                    <Checkbox
                      disabled={!isHotspotLoaded}
                      onChange={() => {
                        setIsSugarcaneLoaded(!isSugarcaneLoaded);
                        setIsHotspotShowed(false);
                      }}
                      checked={isSugarcaneLoaded}
                    />
                  </div>
                  <div className='flex flex-row items-center space-x-2'>
                    <div>
                      <div className='bg-[#fbce5c] rounded-full w-5 h-5'></div>
                    </div>
                    <div className='font-kanit text-[#212121] dark:text-white'>{`${t(
                      'landUse.อ้อย'
                    )}`}</div>
                  </div>
                </div>
                <div className='flex flex-row items-center'>
                  <div>
                    <Checkbox
                      disabled={!isHotspotLoaded}
                      onChange={() => {
                        setIsOtherCropLoaded(!isOtherCropLoaded);
                        setIsHotspotShowed(false);
                      }}
                      checked={isOtherCropLoaded}
                    />
                  </div>
                  <div className='flex flex-row items-center space-x-2'>
                    <div>
                      <div className='bg-[#56c0c0] rounded-full w-5 h-5'></div>
                    </div>
                    <div className='font-kanit text-[#212121] dark:text-white'>{`${t(
                      'landUse.เกษตรอื่น ๆ'
                    )}`}</div>
                  </div>
                </div>
                <div className='flex flex-row items-center'>
                  <div>
                    <Checkbox
                      disabled={!isHotspotLoaded}
                      onChange={() => {
                        setIsForestLoaded(!isForestLoaded);
                        setIsHotspotShowed(false);
                      }}
                      checked={isForestLoaded}
                    />
                  </div>
                  <div className='flex flex-row items-center space-x-2'>
                    <div>
                      <div className='bg-[#9c63fd] rounded-full w-5 h-5'></div>
                    </div>
                    <div className='font-kanit text-[#212121] dark:text-white'>{`${t(
                      'landUse.พื้นที่ป่า'
                    )}`}</div>
                  </div>
                </div>
                <div className='flex flex-row items-center'>
                  <div>
                    <Checkbox
                      disabled={!isHotspotLoaded}
                      onChange={() => {
                        setIsOtherLoaded(!isOtherLoaded);
                        setIsHotspotShowed(false);
                      }}
                      checked={isOtherLoaded}
                    />
                  </div>
                  <div className='flex flex-row items-center space-x-2'>
                    <div>
                      <div className='bg-[#fba046] rounded-full w-5 h-5'></div>
                    </div>
                    <div className='font-kanit text-[#212121] dark:text-white'>{`${t(
                      'landUse.อื่น ๆ'
                    )}`}</div>
                  </div>
                </div>
              </div>
            </ThemeProvider>
            {!isHotspotLoaded && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <span className='loading loading-infinity w-12 text-[#f390b0]'></span>
              </div>
            )}
          </div>
          {isHotspotLoaded ? (
            rows.length === 0 ? (
              <div className='flex flex-col items-center justify-center space-y-4 flex-1'>
                <p className='font-kanit text-2xl font-semibalmostHarvest text-gray-500 dark:text-gray-400'>
                  {t('noData')}
                </p>
              </div>
            ) : (
              <div className='drop-shadow-md aspect-square xl:flex-1'>
                <TableOverview
                  columns={columns}
                  rows={rows}
                  height='100%'
                  colSortDisabled={['district']}
                  colSortDefault='hotspot'
                  direction='desc'
                />
              </div>
            )
          ) : (
            <ThemeProvider theme={skeletonTheme}>
              <Stack spacing={2}>
                {Array.from({ length: 7 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant='rounded'
                    animation='wave'
                    height={50}
                    width='100%'
                  />
                ))}
              </Stack>
            </ThemeProvider>
          )}
        </>
      ) : (
        <div className='flex flex-col items-center justify-center space-y-4 flex-1'>
          <p className='font-kanit text-2xl font-semibalmostHarvest text-gray-500 dark:text-gray-400'>
            {t('noData')}
          </p>
        </div>
      )}
    </div>
  );
}
