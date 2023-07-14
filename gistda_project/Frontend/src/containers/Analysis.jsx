import React, { useEffect, useRef, useState } from 'react';

import axios from 'axios';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js';

import * as turf from '@turf/turf';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import CancelIcon from '@mui/icons-material/Cancel';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import apList from './amphoe.json';
import tbList from './tambon.json';
import pvList from './province.json';
import { map, sphere } from '../components';
import { getDate, getLastCropDate, getLastDateCrop, getMonth } from '.';

const baseURL = 'http://localhost:3001/';

const selectTheme = createTheme({
  palette: {
    mode: JSON.parse(localStorage.getItem('theme')),
    primary: {
      main: '#F390B0',
    },
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
  },
});

const buttonTheme = createTheme({
  palette: {
    mode: JSON.parse(localStorage.getItem('theme')),
    primary: {
      main: '#F390B0',
      dark: '#FF99BA',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#fff',
    },
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
    fontSize: 16,
  },
});

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels,
  Title,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

ChartJS.defaults.color =
  JSON.parse(localStorage.getItem('theme')) === 'dark' ? '#fff' : '#000';
ChartJS.defaults.font.family = 'kanit';

const luColor = {
  rice: '#56c0c0',
  maize: '#fbce5c',
  sugarcane: '#fba046',
  otherCrop: '#fb6584',
  forest: '#9c63fd',
  other: '#48a1e9',
};

const agriColor = {
  rice: '#56c0c0',
  maize: '#fbce5c',
  sugarcane: '#fba046',
  cassava: '#fb6584',
};

const riceAgeColor = [
  '#a8eaea',
  '#8ad6d6',
  '#6cc2c2',
  '#56c0c0',
  '#45adad',
  '#369999',
  '#278585',
  '#196a6a',
];

const maizeAgeColor = [
  '#ffc96b',
  '#ffd27a',
  '#ffbf46',
  '#fbce5c',
  '#e4b254',
  '#c8964c',
  '#a87843',
  '#8a5a3b',
];

const sugarcaneAgeColor = [
  '#fff3e6',
  '#ffe1c2',
  '#ffcf9e',
  '#ffbd7a',
  '#ffab56',
  '#fba046',
  '#f4923d',
  '#ea8135',
  '#e0712d',
  '#d66125',
  '#ce511d',
  '#c64115',
  '#bd310d',
  '#b42105',
  '#ab1100',
  '#9a1000',
  '#891000',
  '#781000',
  '#671000',
  '#561000',
  '#451000',
  '#340f06',
  '#230f06',
  '#120f06',
];

const cassavaAgeColor = [
  '#ffe4eb',
  '#ffcbd6',
  '#ffb2c1',
  '#ff99ab',
  '#ff8096',
  '#ff6780',
  '#fb6584',
  '#f04d77',
  '#e5356a',
  '#d81d5d',
  '#cc1554',
  '#bf0d4a',
  '#b30041',
  '#a00039',
  '#910032',
  '#82002a',
  '#730022',
  '#64001a',
  '#550012',
  '#46000a',
  '#370002',
  '#270002',
  '#180002',
  '#080002',
];

const hexToRGBA = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

let {
  hotspotRiceCount = 0,
  hotspotMaizeCount = 0,
  hotspotSugarcaneCount = 0,
  hotspotOtherCropCount = 0,
  hotspotForestCount = 0,
  hotspotOtherCount = 0,
} = {};

let riceIrrOfficeCount = new Array(17).fill(0);
let maizeIrrOfficeCount = new Array(14).fill(0);
let sugarcaneIrrOfficeCount = new Array(14).fill(0);
let cassavaIrrOfficeCount = new Array(14).fill(0);

let timeoutId;

export default function Analysis() {
  const { t, i18n } = useTranslation();
  const [drawArea, setDrawArea] = useState(0);
  const [riceArea, setRiceArea] = useState(0);
  const [maizeArea, setMaizeArea] = useState(0);
  const [sugarcaneArea, setSugarcaneArea] = useState(0);
  const [cassavaArea, setCassavaArea] = useState(0);
  const [province, setProvince] = useState(10);
  const [district, setDistrict] = useState(0);
  const [subDistrict, setSubDistrict] = useState(0);
  const [riceData, setRiceData] = useState();
  const [maizeData, setMaizeData] = useState();
  const [sugarcaneData, setSugarcaneData] = useState();
  const [cassavaData, setCassavaData] = useState();
  const [coordinates, setCoordinates] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [controller, setController] = useState();
  const prevControllerRef = useRef();
  const [hotspotData, setHotspotData] = useState();

  const hotspotChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: t('amountHotspotInLandType'),
        font: {
          size: 20,
        },
      },
      legend: {
        labels: {
          font: {
            size: 16,
          },
        },
      },
      tooltip: {
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
      },
      datalabels: {
        font: {
          size: 14,
        },
        formatter: (value, context) => {
          return value > 0
            ? value +
                ' ' +
                t('spot') +
                (value > 1 && i18n.language === 'en' ? 's' : '')
            : '';
        },
      },
    },
  };

  const hotspotHistoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scale: {
      ticks: {
        precision: 0,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: t('hotspotHistory'),
        font: {
          size: 20,
        },
      },
      tooltip: {
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
      },
      datalabels: {
        font: {
          size: 14,
        },
        align: 'end',
        formatter: (value, context) => {
          return value > 0 ? value : '';
        },
      },
    },
  };

  const cropTypeAreaChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: t('luArea'),
        font: {
          size: 20,
        },
      },
      tooltip: {
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
      },
      datalabels: {
        font: {
          size: 14,
        },
        formatter: (value, context) => {
          return value + ' ' + t('rai');
        },
      },
    },
  };

  const riceAgeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: t('crop.rice'),
        font: {
          size: 20,
        },
      },
      tooltip: {
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
      },
      datalabels: {
        font: {
          size: 14,
        },
        formatter: (value, context) => {
          return value + ' ' + t('rai');
        },
        rotation: '-90',
        align: '-88',
      },
    },
  };

  const maizeAgeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: t('crop.maize'),
        font: {
          size: 20,
        },
      },
      tooltip: {
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
      },
      datalabels: {
        font: {
          size: 14,
        },
        formatter: (value, context) => {
          return value + ' ' + t('rai');
        },
        rotation: '-90',
        align: '-88',
      },
    },
  };

  const sugarcaneAgeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: t('crop.sugarcane'),
        font: {
          size: 20,
        },
      },
      tooltip: {
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
      },
      datalabels: {
        font: {
          size: 14,
        },
        formatter: (value, context) => {
          return value + ' ' + t('rai');
        },
        rotation: '-90',
        align: '-88',
      },
    },
  };

  const cassavaAgeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: t('crop.cassava'),
        font: {
          size: 20,
        },
      },
      tooltip: {
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
      },
      datalabels: {
        font: {
          size: 14,
        },
        formatter: (value, context) => {
          return value + ' ' + t('rai');
        },
        rotation: '-90',
        align: '-88',
      },
    },
  };

  const irrOfficeChartOptions = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: t('irrOfficeArea'),
        font: {
          size: 20,
        },
      },
      tooltip: {
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
      },
      datalabels: {
        font: {
          size: 14,
        },
        formatter: (value, context) => {
          return value + '%';
        },
        display: function (context) {
          var index = context.dataIndex;
          var value = context.dataset.data[index];
          return value > 0;
        },
      },
    },
  };

  const fetchData = async ({ query, setData }) => {
    const newController = new AbortController();
    prevControllerRef.current = newController;
    setController(newController);

    try {
      const response = await axios.get(`${baseURL}?${query}`, {
        signal: newController.signal,
      });

      if (!prevControllerRef.current.signal.aborted) {
        setData(response.data);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.log(error);
      }
    }
  };
  useEffect(() => {
    if (!showResult) {
      riceIrrOfficeCount = new Array(17).fill(0);
      maizeIrrOfficeCount = new Array(14).fill(0);
      sugarcaneIrrOfficeCount = new Array(14).fill(0);
      cassavaIrrOfficeCount = new Array(14).fill(0);
      setRiceArea(0);
      setMaizeArea(0);
      setSugarcaneArea(0);
      setCassavaArea(0);
      map.Overlays.clear();
      map.Layers.clear();
    }
  }, [showResult]);

  const fetchDataByQuery = (query, setData) => {
    fetchData({
      query,
      setData,
    });
  };

  const handleSearchButton = () => {
    timeoutId = setTimeout(() => {
      setShowResult(true);
      setIsLoading(false);
    }, 4000);
    setDrawArea(0);
    resetHotspotCount();
    setIsLoading(true);

    const month = getMonth();
    const lastCropDate = getLastCropDate();
    const lastDateCrop = getLastDateCrop();

    let coordQuery = '';
    let hotspotQuery = '';
    let cropQueries = [];

    if (parseInt(getDate().format('DD')) <= 15) {
      const from1 = getDate().startOf('month').format('DD-MM-YY');
      const to1 = getDate().format('DD-MM-YY');
      const from2 = getDate().subtract(15, 'day').format('DD-MM-YY');
      const to2 = dayjs(from2, 'DD-MM-YY').endOf('month').format('DD-MM-YY');

      hotspotQuery = `data=hotspot_2023${month}&select=latitude,longitude,lu_hp,pv_tn,ap_tn,pv_en,ap_en,pv_idn,th_date,th_time&where=acq_date BETWEEN '${from1}' AND '${to1}' AND TO_BE_REPLACED UNION ALL SELECT latitude, longitude, lu_hp, pv_tn, ap_tn, pv_en, ap_en, pv_idn, th_date, th_time FROM hotspot_2023${month} where acq_date BETWEEN '${from2}' AND '${to2}' AND TO_BE_REPLACED`;
    } else {
      const from = getDate().subtract(15, 'day').format('DD-MM-YY');
      const to = getDate().format('DD-MM-YY');

      hotspotQuery = `data=hotspot_2023${month}&select=latitude,longitude,lu_hp,pv_tn,ap_tn,pv_en,ap_en,pv_idn,th_date,th_time&where=acq_date BETWEEN '${from}' AND '${to}' AND TO_BE_REPLACED`;
    }

    if (subDistrict !== 0) {
      coordQuery = `data=thai_coord&select=lat,long&where=ta_id='${subDistrict}'`;
      hotspotQuery = hotspotQuery.replaceAll(
        'TO_BE_REPLACED',
        `tb_idn='${subDistrict}'`
      );
      cropQueries = [
        `data=rice_2023${month}${lastCropDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${lastDateCrop}' AND t_code='${subDistrict}') AS subquery`,
        `data=maize_2023${month}${lastCropDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${lastDateCrop}' AND t_code='${subDistrict}') AS subquery`,
        `data=sugarcane_2023${month}${lastCropDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${lastDateCrop}' AND t_code='${subDistrict}') AS subquery`,
        `data=cassava_2023${month}${lastCropDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${lastDateCrop}' AND t_code='${subDistrict}') AS subquery`,
      ];
    } else if (district !== 0) {
      coordQuery = `data=thai_coord&select=lat,long&where=am_id='${district}'`;
      hotspotQuery = hotspotQuery.replaceAll(
        'TO_BE_REPLACED',
        `ap_idn='${district}'`
      );
      cropQueries = [
        `data=rice_2023${month}${lastCropDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${lastDateCrop}' AND a_code='${district}') AS subquery`,
        `data=maize_2023${month}${lastCropDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${lastDateCrop}' AND a_code='${district}') AS subquery`,
        `data=sugarcane_2023${month}${lastCropDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${lastDateCrop}' AND a_code='${district}') AS subquery`,
        `data=cassava_2023${month}${lastCropDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${lastDateCrop}' AND a_code='${district}') AS subquery`,
      ];
    } else {
      coordQuery = `data=thai_coord&select=lat,long&where=ch_id='${province}'`;
      hotspotQuery = hotspotQuery.replaceAll(
        'TO_BE_REPLACED',
        `pv_idn='${province}'`
      );
      cropQueries = [
        `data=rice_2023${month}${lastCropDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${lastDateCrop}' AND p_code='${province}') AS subquery`,
        `data=maize_2023${month}${lastCropDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${lastDateCrop}' AND p_code='${province}') AS subquery`,
        `data=sugarcane_2023${month}${lastCropDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${lastDateCrop}' AND p_code='${province}') AS subquery`,
        `data=cassava_2023${month}${lastCropDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${lastDateCrop}' AND p_code='${province}') AS subquery`,
      ];
    }

    fetchDataByQuery(coordQuery, setCoordinates);
    fetchDataByQuery(hotspotQuery, setHotspotData);

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

  function handleDraw(geom) {
    timeoutId = setTimeout(() => {
      setShowResult(true);
      setIsLoading(false);
    }, 6000);
    const cropNames = ['rice', 'maize', 'sugarcane', 'cassava'];
    const month = getMonth();
    const lastCropDate = getLastCropDate();
    const lastDateCrop = getLastDateCrop();

    let hotspotQuery = '';
    if (parseInt(getDate().format('DD')) <= 15) {
      const from1 = getDate().startOf('month').format('DD-MM-YY');
      const to1 = getDate().format('DD-MM-YY');
      const from2 = getDate().subtract(15, 'day').format('DD-MM-YY');
      const to2 = dayjs(from2, 'DD-MM-YY').endOf('month').format('DD-MM-YY');

      hotspotQuery = `data=hotspot_2023${month}&select=latitude,longitude,lu_hp,pv_tn,ap_tn,pv_en,ap_en,pv_idn,th_date,th_time&where=acq_date BETWEEN '${from1}' AND '${to1}' AND ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
        geom
      )}'), 4326), ST_SetSRID(ST_MakePoint(longitude, latitude), 4326))UNION ALL SELECT latitude, longitude, lu_hp, pv_tn, ap_tn, pv_en, ap_en, pv_idn, th_date, th_time FROM hotspot_2023${month} where acq_date BETWEEN '${from2}' AND '${to2}' AND ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
        geom
      )}'), 4326), ST_SetSRID(ST_MakePoint(longitude, latitude), 4326))`;
    } else {
      const from = getDate().subtract(15, 'day').format('DD-MM-YY');
      const to = getDate().format('DD-MM-YY');

      hotspotQuery = `data=hotspot_2023${month}&select=latitude,longitude,lu_hp,pv_tn,ap_tn,pv_en,ap_en,pv_idn,th_date,th_time&where=acq_date BETWEEN '${from}' AND '${to}' AND ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
        geom
      )}'), 4326), ST_SetSRID(ST_MakePoint(longitude, latitude), 4326))`;
    }

    fetchData({
      query: hotspotQuery,
      setData: setHotspotData,
    });

    cropNames.forEach((cropName) => {
      const query = `data=${cropName}_2023${month}${lastCropDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${lastDateCrop}' AND ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
        geom
      )}'), 4326), ST_SetSRID(geom, 4326))) AS subquery`;
      fetchData({
        query,
        setData: (data) => {
          switch (cropName) {
            case 'rice':
              setRiceData(data);
              break;
            case 'maize':
              setMaizeData(data);
              break;
            case 'sugarcane':
              setSugarcaneData(data);
              break;
            case 'cassava':
              setCassavaData(data);
              break;
            default:
              break;
          }
        },
      });
    });
  }

  const cancelSearch = () => {
    if (controller) {
      controller.abort();
      setController(null);
    }
    clearTimeout(timeoutId);
    setRiceArea(0);
    setMaizeArea(0);
    setSugarcaneArea(0);
    setCassavaArea(0);
    setDrawArea(0);
    resetHotspotCount();
    setIsLoading(false);
    setShowResult(false);
    map.Overlays.clear();
    map.Layers.clear();
  };

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
      const pt = district !== 0 ? 200 : 100;
      const pb = district !== 0 ? 200 : 100;
      map.Overlays.add(shape);
      map.bound(zoomTemp, { padding: { top: pt, bottom: pb } });
    } else {
      console.log('No valid coordinates found.');
    }
  }, [coordinates]);

  useEffect(() => {
    if (!hotspotData) return;
    resetHotspotCount();
    hotspotData.result.forEach((hotspot) => {
      switch (hotspot.lu_hp) {
        case 'A101':
          map.Overlays.add(
            new sphere.Dot(
              {
                lon: JSON.parse(hotspot.longitude),
                lat: JSON.parse(hotspot.latitude),
              },
              {
                lineWidth: 20,
                draggable: false,
                lineColor: hexToRGBA(luColor.rice, 0.5),
                data: hotspot.lu_hp,
              }
            )
          );
          hotspotRiceCount += 1;
          break;
        case 'A202':
          map.Overlays.add(
            new sphere.Dot(
              {
                lon: JSON.parse(hotspot.longitude),
                lat: JSON.parse(hotspot.latitude),
              },
              {
                lineWidth: 20,
                draggable: false,
                lineColor: hexToRGBA(luColor.maize, 0.5),
                data: hotspot.lu_hp,
              }
            )
          );
          hotspotMaizeCount += 1;
          break;
        case 'A203':
          map.Overlays.add(
            new sphere.Dot(
              {
                lon: JSON.parse(hotspot.longitude),
                lat: JSON.parse(hotspot.latitude),
              },
              {
                lineWidth: 20,
                draggable: false,
                lineColor: hexToRGBA(luColor.sugarcane, 0.5),
                data: hotspot.lu_hp,
              }
            )
          );
          hotspotSugarcaneCount += 1;
          break;
        case 'A999':
          map.Overlays.add(
            new sphere.Dot(
              {
                lon: JSON.parse(hotspot.longitude),
                lat: JSON.parse(hotspot.latitude),
              },
              {
                lineWidth: 20,
                draggable: false,
                lineColor: hexToRGBA(luColor.otherCrop, 0.5),
                data: hotspot.lu_hp,
              }
            )
          );
          hotspotOtherCropCount += 1;
          break;
        case 'F000':
          map.Overlays.add(
            new sphere.Dot(
              {
                lon: JSON.parse(hotspot.longitude),
                lat: JSON.parse(hotspot.latitude),
              },
              {
                lineWidth: 20,
                draggable: false,
                lineColor: hexToRGBA(luColor.forest, 0.5),
                data: hotspot.lu_hp,
              }
            )
          );
          hotspotForestCount += 1;
          break;
        case 'O000':
          map.Overlays.add(
            new sphere.Dot(
              {
                lon: JSON.parse(hotspot.longitude),
                lat: JSON.parse(hotspot.latitude),
              },
              {
                lineWidth: 20,
                draggable: false,
                lineColor: hexToRGBA(luColor.other, 0.5),
                data: hotspot.lu_hp,
              }
            )
          );
          hotspotOtherCount += 1;
          break;
        default:
          break;
      }
    });
  }, [hotspotData]);

  useEffect(() => {
    if (!(riceData && riceData.result[0].feature_collection.features)) return;
    setTimeout(() => {
      setRiceArea(turf.area(riceData.result[0].feature_collection) / 1600);
      countCropIrrOffice(
        riceData.result[0].feature_collection.features,
        riceIrrOfficeCount
      );
      let layer_crop_rice = new sphere.Layer({
        sources: {
          rice: {
            type: 'geojson',
            data: riceData.result[0].feature_collection,
          },
        },
        layers: [
          {
            id: 'layer_crop_rice',
            type: 'fill',
            source: 'rice',
            zIndex: 4,
            paint: {
              'fill-color': [
                'match',
                ['get', 'legend'],
                1,
                riceAgeColor[0],
                2,
                riceAgeColor[1],
                3,
                riceAgeColor[2],
                4,
                riceAgeColor[3],
                5,
                riceAgeColor[4],
                6,
                riceAgeColor[5],
                7,
                riceAgeColor[6],
                8,
                riceAgeColor[7],
                '#000',
              ],
              'fill-opacity': 0.5,
            },
          },
        ],
      });
      map.Layers.add(layer_crop_rice);
    }, 1000);
  }, [riceData]);

  useEffect(() => {
    if (!(maizeData && maizeData.result[0].feature_collection.features)) return;
    setTimeout(() => {
      setMaizeArea(turf.area(maizeData.result[0].feature_collection) / 1600);
      countCropIrrOffice(
        maizeData.result[0].feature_collection.features,
        maizeIrrOfficeCount
      );
      let layer_crop_maize = new sphere.Layer({
        sources: {
          maize: {
            type: 'geojson',
            data: maizeData.result[0].feature_collection,
          },
        },
        layers: [
          {
            id: 'layer_crop_maize',
            type: 'fill',
            source: 'maize',
            zIndex: 4,
            paint: {
              'fill-color': [
                'match',
                ['get', 'legend'],
                0,
                maizeAgeColor[0],
                1,
                maizeAgeColor[1],
                2,
                maizeAgeColor[2],
                3,
                maizeAgeColor[3],
                4,
                maizeAgeColor[4],
                5,
                maizeAgeColor[5],
                6,
                maizeAgeColor[6],
                7,
                maizeAgeColor[7],
                '#000',
              ],
              'fill-opacity': 0.5,
            },
          },
        ],
      });
      map.Layers.add(layer_crop_maize);
    }, 1000);
  }, [maizeData]);

  useEffect(() => {
    if (!(sugarcaneData && sugarcaneData.result[0].feature_collection.features))
      return;
    setTimeout(() => {
      setSugarcaneArea(
        turf.area(sugarcaneData.result[0].feature_collection) / 1600
      );
      countCropIrrOffice(
        sugarcaneData.result[0].feature_collection.features,
        sugarcaneIrrOfficeCount
      );
      let layer_crop_sugarcane = new sphere.Layer({
        sources: {
          sugarcane: {
            type: 'geojson',
            data: sugarcaneData.result[0].feature_collection,
          },
        },
        layers: [
          {
            id: 'layer_crop_sugarcane',
            type: 'fill',
            source: 'sugarcane',
            zIndex: 4,
            paint: {
              'fill-color': [
                'match',
                ['get', 'legend'],
                1,
                sugarcaneAgeColor[0],
                2,
                sugarcaneAgeColor[1],
                3,
                sugarcaneAgeColor[2],
                4,
                sugarcaneAgeColor[3],
                5,
                sugarcaneAgeColor[4],
                6,
                sugarcaneAgeColor[5],
                7,
                sugarcaneAgeColor[6],
                8,
                sugarcaneAgeColor[7],
                9,
                sugarcaneAgeColor[8],
                10,
                sugarcaneAgeColor[9],
                11,
                sugarcaneAgeColor[10],
                12,
                sugarcaneAgeColor[11],
                13,
                sugarcaneAgeColor[12],
                14,
                sugarcaneAgeColor[13],
                15,
                sugarcaneAgeColor[14],
                16,
                sugarcaneAgeColor[15],
                17,
                sugarcaneAgeColor[16],
                18,
                sugarcaneAgeColor[17],
                19,
                sugarcaneAgeColor[18],
                20,
                sugarcaneAgeColor[19],
                21,
                sugarcaneAgeColor[20],
                22,
                sugarcaneAgeColor[21],
                23,
                sugarcaneAgeColor[22],
                24,
                sugarcaneAgeColor[23],
                '#000',
              ],
              'fill-opacity': 0.5,
            },
          },
        ],
      });
      map.Layers.add(layer_crop_sugarcane);
    }, 1000);
  }, [sugarcaneData]);

  useEffect(() => {
    if (!(cassavaData && cassavaData.result[0].feature_collection.features))
      return;
    setTimeout(() => {
      setCassavaArea(
        turf.area(cassavaData.result[0].feature_collection) / 1600
      );
      countCropIrrOffice(
        cassavaData.result[0].feature_collection.features,
        cassavaIrrOfficeCount
      );
      let layer_crop_cassava = new sphere.Layer({
        sources: {
          cassava: {
            type: 'geojson',
            data: cassavaData.result[0].feature_collection,
          },
        },
        layers: [
          {
            id: 'layer_crop_cassava',
            type: 'fill',
            source: 'cassava',
            zIndex: 4,
            paint: {
              'fill-color': [
                'match',
                ['get', 'legend'],
                1,
                cassavaAgeColor[0],
                2,
                cassavaAgeColor[1],
                3,
                cassavaAgeColor[2],
                4,
                cassavaAgeColor[3],
                5,
                cassavaAgeColor[4],
                6,
                cassavaAgeColor[5],
                7,
                cassavaAgeColor[6],
                8,
                cassavaAgeColor[7],
                9,
                cassavaAgeColor[8],
                10,
                cassavaAgeColor[9],
                11,
                cassavaAgeColor[10],
                12,
                cassavaAgeColor[11],
                13,
                cassavaAgeColor[12],
                14,
                cassavaAgeColor[13],
                15,
                cassavaAgeColor[14],
                16,
                cassavaAgeColor[15],
                17,
                cassavaAgeColor[16],
                18,
                cassavaAgeColor[17],
                19,
                cassavaAgeColor[18],
                20,
                cassavaAgeColor[19],
                21,
                cassavaAgeColor[20],
                22,
                cassavaAgeColor[21],
                23,
                cassavaAgeColor[22],
                24,
                cassavaAgeColor[23],
                '#000',
              ],
              'fill-opacity': 0.5,
            },
          },
        ],
      });
      map.Layers.add(layer_crop_cassava);
    }, 1000);
  }, [cassavaData]);

  useEffect(() => {
    const handleDrawCreate = (e) => {
      setIsLoading(true);
      setShowResult(false);
      if (e.features && e.features[0].geometry.coordinates.length === 1) {
        handleDraw(e.features[0].geometry);
        setDrawArea(turf.area(e.features[0]));
      } else {
        handleDraw(e.createdFeatures[0].geometry);
        setDrawArea(turf.area(e.createdFeatures[0]));
      }
    };

    const handleUpdate = (e) => {
      setIsLoading(true);
      setShowResult(false);
      if (e.features[0].geometry.coordinates.length === 1) {
        handleDraw(e.features[0].geometry);
        setDrawArea(turf.area(e.features[0]));
      } else {
        handleDraw(e.features[0].geometry);
        setDrawArea(turf.area(e.features[0]));
      }
    };

    const handleDrawDelete = (e) => {
      setRiceArea(0);
      setMaizeArea(0);
      setSugarcaneArea(0);
      setCassavaArea(0);
      setDrawArea(0);
      resetHotspotCount();
      setIsLoading(false);
      setShowResult(false);
    };

    if (map) {
      map.Renderer.on('draw.create', handleDrawCreate);
      map.Renderer.on('draw.delete', handleDrawDelete);
      map.Renderer.on('draw.combine', handleDrawCreate);
      map.Renderer.on('draw.update', handleUpdate);
    }
  }, []);

  const hotspotLuData = {
    labels: [
      t('landUse.rice'),
      t('landUse.maize'),
      t('landUse.sugarcane'),
      t('landUse.otherCrop'),
      t('landUse.forest'),
      t('landUse.other'),
    ],
    datasets: [
      {
        label: t('spot'),
        data: [
          hotspotRiceCount,
          hotspotMaizeCount,
          hotspotSugarcaneCount,
          hotspotOtherCropCount,
          hotspotForestCount,
          hotspotOtherCount,
        ],
        backgroundColor: Object.values(luColor),
        borderWidth: 0,
      },
    ],
  };

  const genLUData = (landUseCode, label, luColor, startDay, hotspotData) => {
    return Array.from(
      {
        length: 16,
      },
      (_, i) =>
        hotspotData?.result.filter(
          (item) =>
            dayjs(item.th_date, 'DD-MM-YY').format('DD') ===
              dayjs(startDay).add(i, 'day').format('DD') &&
            item.lu_hp === landUseCode
        ).length
    );
  };

  const startDate = getDate().subtract(15, 'day');
  const endDate = getDate();

  const dateArray = [];
  let currentDate = startDate;

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    dateArray.push(currentDate.format('DD/MM/YYYY'));
    currentDate = currentDate.add(1, 'day');
  }

  function calcLinReg(landUseData) {
    const n = landUseData.length; // Get the length of the landUseData array

    // Calculate the sum of the indices (x values)
    const landUseDataSumX = (n * (n - 1)) / 2;

    // Calculate the sum of the land use data values (y values)
    const landUseDataSumY = landUseData.reduce((a, b) => a + b, 0);

    // Calculate the sum of the products of the indices and land use data values (x * y)
    const landUseDataSumXY = landUseData
      .map((y, i) => y * i)
      .reduce((a, b) => a + b, 0);

    // Calculate the sum of the squared indices (x^2)
    const landUseDataSumXX = landUseData
      .map((_, i) => i * i)
      .reduce((a, b) => a + b, 0);

    // Calculate the slope of the linear regression line (m)
    const landUseDataM =
      (n * landUseDataSumXY - landUseDataSumX * landUseDataSumY) /
      (n * landUseDataSumXX - landUseDataSumX * landUseDataSumX);

    // Calculate the y-intercept of the linear regression line (b)
    const landUseDataB = (landUseDataSumY - landUseDataM * landUseDataSumX) / n;

    // Generate the predicted values on the regression line
    const landUseDataLine = landUseData.map(
      (_, i) => landUseDataM * i + landUseDataB
    );

    // Calculate the percentage change between the first and last predicted values on the regression line
    const percentageChange =
      ((landUseDataLine[n - 1] - landUseDataLine[0]) /
        Math.abs(landUseDataLine[0])) *
      100;

    return percentageChange; // Return the calculated percentage change
  }

  const riceHistory = genLUData(
    'A101',
    t('landUse.rice'),
    luColor.rice,
    startDate,
    hotspotData
  );

  const maizeHistory = genLUData(
    'A202',
    t('landUse.maize'),
    luColor.maize,
    startDate,
    hotspotData
  );

  const sugarcaneHistory = genLUData(
    'A203',
    t('landUse.sugarcane'),
    luColor.sugarcane,
    startDate,
    hotspotData
  );

  const otherCropHistory = genLUData(
    'A999',
    t('landUse.otherCrop'),
    luColor.otherCrop,
    startDate,
    hotspotData
  );

  const forestHistory = genLUData(
    'F000',
    t('landUse.forest'),
    luColor.forest,
    startDate,
    hotspotData
  );

  const otherHistory = genLUData(
    'O000',
    t('landUse.other'),
    luColor.other,
    startDate,
    hotspotData
  );

  const percentageChangedRice = calcLinReg(riceHistory);
  const percentageChangedMaize = calcLinReg(maizeHistory);
  const percentageChangedSugarcane = calcLinReg(sugarcaneHistory);
  const percentageChangedOtherCrop = calcLinReg(otherCropHistory);
  const percentageChangedForest = calcLinReg(forestHistory);
  const percentageChangedOther = calcLinReg(otherHistory);

  const hotspotHistoryData = {
    labels: dateArray,
    datasets: [
      {
        label: t('landUse.rice'),
        data: riceHistory,
        borderColor: hexToRGBA(luColor.rice, 0.5),
        backgroundColor: luColor.rice,
      },
      {
        label: t('landUse.maize'),
        data: maizeHistory,
        borderColor: hexToRGBA(luColor.maize, 0.5),
        backgroundColor: luColor.maize,
      },
      {
        label: t('landUse.sugarcane'),
        data: sugarcaneHistory,
        borderColor: hexToRGBA(luColor.sugarcane, 0.5),
        backgroundColor: luColor.sugarcane,
      },
      {
        label: t('landUse.otherCrop'),
        data: otherCropHistory,
        borderColor: hexToRGBA(luColor.otherCrop, 0.5),
        backgroundColor: luColor.otherCrop,
      },
      {
        label: t('landUse.forest'),
        data: forestHistory,
        borderColor: hexToRGBA(luColor.forest, 0.5),
        backgroundColor: luColor.forest,
      },
      {
        label: t('landUse.other'),
        data: otherHistory,
        borderColor: hexToRGBA(luColor.other, 0.5),
        backgroundColor: luColor.other,
      },
    ],
  };

  const cropAreaData = {
    labels: [
      t('crop.rice'),
      t('crop.maize'),
      t('crop.sugarcane'),
      t('crop.cassava'),
    ],
    datasets: [
      {
        label: '',
        data: [
          riceArea.toFixed(3),
          maizeArea.toFixed(3),
          sugarcaneArea.toFixed(3),
          cassavaArea.toFixed(3),
        ],
        backgroundColor: Object.values(agriColor),
        borderWidth: 0,
      },
    ],
  };

  const riceAgeData = {
    labels: [
      '1-15 มี.ค. 66 / 16 สัปดาห์',
      '16-31 มี.ค. 66 / 14 สัปดาห์',
      '1-15 เม.ย. 66 / 12 สัปดาห์',
      '16-30 เม.ย. 66 / 10 สัปดาห์',
      '1-15 พ.ค. 66 / 8 สัปดาห์',
      '16-31 พ.ค. 66 / 6 สัปดาห์',
      '1-15 มิ.ย. 66 / 4 สัปดาห์',
      '16-30 มิ.ย. 66 / 2 สัปดาห์',
    ],
    datasets: [
      {
        label: t('crop.rice'),
        data: Array.from(
          {
            length: 8,
          },
          (_, i) =>
            riceData?.result[0].feature_collection.features?.reduce(
              (sum, item) =>
                item.properties.legend === i + 1
                  ? Number((sum + item.properties.rai).toFixed(3))
                  : sum,
              0
            )
        ),
        backgroundColor: riceAgeColor.toReversed(),
      },
    ],
  };

  const maizeAgeData = {
    labels: [
      '1-15 มี.ค. 66 / 16 สัปดาห์',
      '16-31 มี.ค. 66 / 14 สัปดาห์',
      '1-15 เม.ย. 66 / 12 สัปดาห์',
      '16-30 เม.ย. 66 / 10 สัปดาห์',
      '1-15 พ.ค. 66 / 8 สัปดาห์',
      '16-31 พ.ค. 66 / 6 สัปดาห์',
      '1-15 มิ.ย. 66 / 4 สัปดาห์',
      '16-30 มิ.ย. 66 / 2 สัปดาห์',
    ],
    datasets: [
      {
        label: t('crop.maize'),
        data: Array.from(
          {
            length: 8,
          },
          (_, i) =>
            maizeData?.result[0].feature_collection.features?.reduce(
              (sum, item) =>
                item.properties.legend === i
                  ? Number((sum + item.properties.rai).toFixed(3))
                  : sum,
              0
            )
        ),
        backgroundColor: maizeAgeColor.toReversed(),
      },
    ],
  };

  const sugarcaneAgeData = {
    labels: [
      '01-15 ก.ค. 2565',
      '16-31 ก.ค. 2565',
      '01-15 ส.ค. 2565',
      '16-31 ส.ค. 2565',
      '01-15 ก.ย. 2565',
      '16-30 ก.ย. 2565',
      '01-15 ต.ค. 2565',
      '16-31 ต.ค. 2565',
      '01-15 พ.ย. 2565',
      '16-30 พ.ย. 2565',
      '01-15 ธ.ค. 2565',
      '16-31 ธ.ค. 2565',
      '01-15 ม.ค. 2566',
      '16-31 ม.ค. 2566',
      '01-15 ก.พ. 2566',
      '16-28 ก.พ. 2566',
      '01-15 มี.ค. 2566',
      '16-31 มี.ค. 2566',
      '01-15 เม.ย. 2566',
      '16-30 เม.ย. 2566',
      '01-15 พ.ค. 2566',
      '16-31 พ.ค. 2566',
      '01-15 มิ.ย. 2566',
      '16-30 มิ.ย. 2566',
    ],
    datasets: [
      {
        label: t('crop.sugarcane'),
        data: Array.from(
          {
            length: 24,
          },
          (_, i) =>
            sugarcaneData?.result[0].feature_collection.features?.reduce(
              (sum, item) =>
                item.properties.legend === i + 1
                  ? Number((sum + item.properties.rai).toFixed(3))
                  : sum,
              0
            )
        ),
        backgroundColor: sugarcaneAgeColor.toReversed(),
      },
    ],
  };

  const cassavaAgeData = {
    labels: [
      '01-15 ก.ค. 2565',
      '16-31 ก.ค. 2565',
      '01-15 ส.ค. 2565',
      '16-31 ส.ค. 2565',
      '01-15 ก.ย. 2565',
      '16-30 ก.ย. 2565',
      '01-15 ต.ค. 2565',
      '16-31 ต.ค. 2565',
      '01-15 พ.ย. 2565',
      '16-30 พ.ย. 2565',
      '01-15 ธ.ค. 2565',
      '16-31 ธ.ค. 2565',
      '01-15 ม.ค. 2566',
      '16-31 ม.ค. 2566',
      '01-15 ก.พ. 2566',
      '16-28 ก.พ. 2566',
      '01-15 มี.ค. 2566',
      '16-31 มี.ค. 2566',
      '01-15 เม.ย. 2566',
      '16-30 เม.ย. 2566',
      '01-15 พ.ค. 2566',
      '16-31 พ.ค. 2566',
      '01-15 มิ.ย. 2566',
      '16-30 มิ.ย. 2566',
    ],
    datasets: [
      {
        label: t('crop.cassava'),
        data: Array.from(
          {
            length: 24,
          },
          (_, i) =>
            cassavaData?.result[0].feature_collection.features?.reduce(
              (sum, item) =>
                item.properties.legend === i + 1
                  ? Number((sum + item.properties.rai).toFixed(3))
                  : sum,
              0
            )
        ),
        backgroundColor: cassavaAgeColor.toReversed(),
      },
    ],
  };

  const cropTypes = [
    {
      label: t('crop.rice'),
      data: riceIrrOfficeCount,
      backgroundColor: agriColor.rice,
      stack: 0,
    },
    {
      label: t('crop.maize'),
      data: maizeIrrOfficeCount,
      backgroundColor: agriColor.maize,
      stack: 1,
    },
    {
      label: t('crop.sugarcane'),
      data: sugarcaneIrrOfficeCount,
      backgroundColor: agriColor.sugarcane,
      stack: 2,
    },
    {
      label: t('crop.cassava'),
      data: cassavaIrrOfficeCount,
      backgroundColor: agriColor.cassava,
      stack: 3,
    },
  ];

  const irr_officeData = {
    labels: Array.from(
      { length: 17 },
      (_, index) => t('irr_office') + ' ' + (index + 1)
    ),
    datasets: cropTypes.map((crop) => ({
      label: crop.label,
      data: crop.data.map((item, index) => {
        if (item !== 0) {
          return ((item / crop.data.reduce((a, b) => a + b, 0)) * 100).toFixed(
            2
          );
        }
        return 0;
      }),
      categoryPercentage: 1.0,
      barPercentage: 1.0,
      backgroundColor: crop.backgroundColor,
      borderWidth: 0,
      stack: crop.stack,
      skipNull: true,
    })),
  };

  const hotspotCount =
    hotspotRiceCount +
    hotspotMaizeCount +
    hotspotSugarcaneCount +
    hotspotOtherCropCount +
    hotspotForestCount +
    hotspotOtherCount;

  return (
    <>
      {showResult ? (
        <div className='flex flex-col w-full space-y-4'>
          <div className='flex justify-between'>
            <ThemeProvider theme={buttonTheme}>
              <Button
                variant='contained'
                startIcon={<ArrowBackIosIcon />}
                onClick={() => setShowResult(false)}
              >
                {t('back')}
              </Button>
            </ThemeProvider>
            <ThemeProvider theme={buttonTheme}>
              <IconButton
                color='secondary'
                size='small'
                onClick={() => {
                  document
                    .getElementById('visualHeader')
                    ?.classList.toggle('xl:h-screen');
                  document
                    .getElementById('visualHeader')
                    ?.classList.toggle('xl:mb-44');
                  document
                    .getElementById('visual1')
                    ?.classList.toggle('xl:flex-row');
                  document
                    .getElementById('visual2')
                    ?.classList.toggle('xl:w-3/5');
                  document
                    .getElementById('visual2')
                    ?.classList.toggle('xl:order-2');
                  document
                    .getElementById('visual3')
                    ?.classList.toggle('xl:rounded-none');
                  document
                    .getElementById('visual3')
                    ?.classList.toggle('xl:rounded-tr-lg');
                  document
                    .getElementById('visual4')
                    ?.classList.toggle('xl:rounded-none');
                  document
                    .getElementById('visual4')
                    ?.classList.toggle('xl:rounded-none');
                  document
                    .getElementById('overviewPage')
                    ?.classList.toggle('xl:order-1');
                  document
                    .getElementById('overviewPage')
                    ?.classList.toggle('xl:w-2/5');
                  document
                    .getElementById('analysisPage')
                    ?.classList.toggle('xl:order-1');
                  document
                    .getElementById('analysisPage')
                    ?.classList.toggle('xl:w-2/5');
                }}
              >
                <AspectRatioIcon />
              </IconButton>
            </ThemeProvider>
          </div>
          {drawArea > 0 && (
            <>
              <div className='stats shadow bg-[#f7b142]'>
                <div className='stat'>
                  <div className='stat-title font-kanit text-white'>
                    {t('area')}
                  </div>
                  <div className='stat-value text-white'>
                    {drawArea.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                    <span className='font-kanit'>{t('sqm')}</span>
                  </div>
                  <div className='stat-desc font-kanit text-gray-100'>
                    {t('or')}{' '}
                    {(drawArea / 1600)
                      .toFixed(3)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                    {t('rai').toLowerCase()}
                  </div>
                </div>
              </div>
            </>
          )}
          {hotspotCount > 0 && (
            <>
              <div className='stats shadow'>
                <div className='stat bg-[#826954]'>
                  <div className='stat-title font-kanit text-white'>
                    {t('amountHotspotInLandType')}
                  </div>
                  <div className='stat-value text-white'>
                    {hotspotCount}{' '}
                    <span className='font-kanit'>
                      {t('spot').toLowerCase()}
                      {hotspotCount > 1 && i18n.language === 'en' ? 's' : ''}
                    </span>
                  </div>
                  <div className='stat-desc font-kanit'></div>
                </div>
              </div>
              <div className='flex justify-center'>
                <div className='h-[500px] w-full'>
                  <Doughnut
                    data={hotspotLuData}
                    options={hotspotChartOptions}
                  />
                </div>
              </div>
              <div className='h-[500px]'>
                <Line
                  data={hotspotHistoryData}
                  options={hotspotHistoryChartOptions}
                />
              </div>
              <div className='stats stats-vertical lg:stats-horizontal shadow'>
                <div className={`stat bg-[${luColor.rice}]`}>
                  <div className='stat-title text-white font-kanit'>
                    {t('landUse.rice')}
                  </div>
                  <div className='stat-value text-white'>
                    {!isNaN(percentageChangedRice.toFixed(2))
                      ? (percentageChangedRice.toFixed(2) > 0 ? '↗︎' : '↘︎') +
                        Math.abs(percentageChangedRice).toFixed(2) +
                        '%'
                      : '-'}
                  </div>
                </div>
                <div className={`stat bg-[${luColor.maize}]`}>
                  <div className='stat-title text-white font-kanit'>
                    {t('landUse.maize')}
                  </div>
                  <div className='stat-value text-white'>
                    {!isNaN(percentageChangedMaize.toFixed(2))
                      ? (percentageChangedMaize.toFixed(2) > 0 ? '↗︎' : '↘︎') +
                        Math.abs(percentageChangedMaize).toFixed(2) +
                        '%'
                      : '-'}
                  </div>
                </div>
                <div className={`stat bg-[${luColor.sugarcane}]`}>
                  <div className='stat-title text-white font-kanit'>
                    {t('landUse.sugarcane')}
                  </div>
                  <div className='stat-value text-white'>
                    {!isNaN(percentageChangedSugarcane.toFixed(2))
                      ? (percentageChangedSugarcane.toFixed(2) > 0
                          ? '↗︎'
                          : '↘︎') +
                        Math.abs(percentageChangedSugarcane).toFixed(2) +
                        '%'
                      : '-'}
                  </div>
                </div>
                <div className={`stat bg-[${luColor.otherCrop}]`}>
                  <div className='stat-title text-white font-kanit'>
                    {t('landUse.otherCrop')}
                  </div>
                  <div className='stat-value text-white'>
                    {!isNaN(percentageChangedOtherCrop.toFixed(2))
                      ? (percentageChangedOtherCrop.toFixed(2) > 0
                          ? '↗︎'
                          : '↘︎') +
                        Math.abs(percentageChangedOtherCrop).toFixed(2) +
                        '%'
                      : '-'}
                  </div>
                </div>
                <div className={`stat bg-[${luColor.forest}]`}>
                  <div className='stat-title text-white font-kanit'>
                    {t('landUse.forest')}
                  </div>
                  <div className='stat-value text-white'>
                    {!isNaN(percentageChangedForest.toFixed(2))
                      ? (percentageChangedForest.toFixed(2) > 0 ? '↗︎' : '↘︎') +
                        Math.abs(percentageChangedForest).toFixed(2) +
                        '%'
                      : '-'}
                  </div>
                </div>
                <div className={`stat bg-[${luColor.other}]`}>
                  <div className='stat-title text-white font-kanit'>
                    {t('landUse.other')}
                  </div>
                  <div className='stat-value text-white'>
                    {!isNaN(percentageChangedOther.toFixed(2))
                      ? (percentageChangedOther.toFixed(2) > 0 ? '↗︎' : '↘︎') +
                        Math.abs(percentageChangedOther).toFixed(2) +
                        '%'
                      : '-'}
                  </div>
                </div>
              </div>
            </>
          )}
          {(riceArea > 0 ||
            maizeArea > 0 ||
            sugarcaneArea > 0 ||
            cassavaArea > 0) && (
            <>
              <div className='stats shadow'>
                <div className='stat bg-[#6fb289]'>
                  <div className='stat-title font-kanit text-white'>
                    {t('agriArea')}
                  </div>
                  <div className='stat-value text-white'>
                    {(riceArea + maizeArea + sugarcaneArea + cassavaArea)
                      .toFixed(3)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                    <span className='font-kanit'>{t('rai')}</span>
                  </div>
                  <div className='stat-desc font-kanit text-gray-100'>
                    {t('or')}{' '}
                    {(
                      (riceArea + maizeArea + sugarcaneArea + cassavaArea) *
                      1600
                    )
                      .toFixed(3)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                    {t('sqm')}
                  </div>
                </div>
              </div>
              <div className='flex flex-col justify-center'>
                <div className='h-96'>
                  <Bar data={cropAreaData} options={cropTypeAreaChartOptions} />
                </div>
                {riceArea > 0 && (
                  <div className='h-96'>
                    <Bar data={riceAgeData} options={riceAgeChartOptions} />
                  </div>
                )}
                {maizeArea > 0 && (
                  <div className='h-96'>
                    <Bar data={maizeAgeData} options={maizeAgeChartOptions} />
                  </div>
                )}
                {sugarcaneArea > 0 && (
                  <div className='h-96'>
                    <Bar
                      data={sugarcaneAgeData}
                      options={sugarcaneAgeChartOptions}
                    />
                  </div>
                )}
                {cassavaArea > 0 && (
                  <div className='h-96'>
                    <Bar
                      data={cassavaAgeData}
                      options={cassavaAgeChartOptions}
                    />
                  </div>
                )}

                <div className='h-[1200px]'>
                  <Bar data={irr_officeData} options={irrOfficeChartOptions} />
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className='flex flex-col justify-center space-y-4 mt-2'>
          <h1 className='font-kanit text-[#212121] dark:text-white text-2xl font-semibold text-center'>
            {t('drawAreaRequest')}
          </h1>
          <Divider className='before:border-neutral-400 before:bg-neutral-400 before:border-[1px] after:border-neutral-400 after:bg-neutral-400 after:border-[1px] text-neutral-400 font-kanit'>
            {t('or')}
          </Divider>
          <h1 className='font-kanit text-[#212121] dark:text-white text-2xl font-semibold text-center'>
            {t('selectFromBelow')}
          </h1>
          <div>
            <form className='flex flex-col space-y-4'>
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
                          ? province.changwat_t.replace('จ.', '')
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
                                  .replace('อ.', '')
                                  .replace('เขต', '')
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
                                  .replace('ต.', '')
                                  .replace('แขวง', '')
                              : subDistrict.tambon_e}
                          </MenuItem>
                        )
                    )}
                  </Select>
                </FormControl>
              </ThemeProvider>
              <ThemeProvider theme={buttonTheme}>
                <div className='relative w-full'>
                  <Button
                    variant='contained'
                    startIcon={<QueryStatsIcon />}
                    size='large'
                    onClick={handleSearchButton}
                    className='w-full z-10'
                    disabled={isLoading}
                  >
                    {isLoading ? t('analyzing') : t('startAnalysis')}
                  </Button>
                  <div className='absolute top-0 left-0 flex items-center justify-center w-full h-full'>
                    {isLoading && (
                      <span className='loading loading-infinity w-12 text-[#f390b0]'></span>
                    )}
                  </div>
                </div>
                {isLoading && (
                  <div className='w-full'>
                    <Button
                      variant='outlined'
                      color='error'
                      startIcon={<CancelIcon />}
                      size='large'
                      onClick={() => {
                        cancelSearch();
                      }}
                      className='w-full z-10'
                    >
                      {t('cancelAnalysis')}
                    </Button>
                  </div>
                )}
              </ThemeProvider>
            </form>
          </div>
        </div>
      )}
    </>
  );

  function resetHotspotCount() {
    hotspotRiceCount =
      hotspotMaizeCount =
      hotspotSugarcaneCount =
      hotspotOtherCropCount =
      hotspotForestCount =
      hotspotOtherCount =
        0;
  }

  function countCropIrrOffice(data, targetArray) {
    data.forEach((d) => {
      if (d.properties.office_cod) {
        targetArray[parseInt(d.properties.office_cod) - 1]++;
      }
    });
  }
}
