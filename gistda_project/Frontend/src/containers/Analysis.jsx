import React, { useEffect, useRef, useState } from 'react';

import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
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
import FormControl from '@mui/material/FormControl';
import CancelIcon from '@mui/icons-material/Cancel';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import apList from './amphoe.json';
import tbList from './tambon.json';
import pvList from './province.json';
import { map, sphere } from '../components';
import { getDots, getLastCropDate, getLastDateCrop, getMonth } from '.';

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

let {
  riceCount = 0,
  maizeCount = 0,
  sugarcaneCount = 0,
  otherCropCount = 0,
  forestAreaCount = 0,
  otherCount = 0,
} = {};

let riceIrrOfficeCount = new Array(17).fill(0);
let maizeIrrOfficeCount = new Array(14).fill(0);
let sugarcaneIrrOfficeCount = new Array(14).fill(0);
let cassavaIrrOfficeCount = new Array(14).fill(0);

export default function Analysis() {
  const { t, i18n } = useTranslation();
  const [drawArea, setDrawArea] = useState(0);
  const [riceArea, setRiceArea] = useState(0);
  const [maizeArea, setMaizeArea] = useState(0);
  const [sugarcaneArea, setSugarcaneArea] = useState(0);
  const [cassavaArea, setCassavaArea] = useState(0);
  const [dotCount, setDotCount] = useState(0);
  const [province, setProvince] = useState(10);
  const [provinceList, setProvinceList] = useState(pvList);
  const [district, setDistrict] = useState(0);
  const [districtList, setDistrictList] = useState(apList);
  const [subDistrict, setSubDistrict] = useState(0);
  const [subDistrictList, setSubDistrictList] = useState(tbList);
  const [riceData, setRiceData] = useState();
  const [maizeData, setMaizeData] = useState();
  const [sugarcaneData, setSugarcaneData] = useState();
  const [cassavaData, setCassavaData] = useState();
  const [coordinates, setCoordinates] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [overlay, setOverlay] = useState();
  const [showResult, setShowResult] = useState(false);
  const [controller, setController] = useState(null);
  const prevControllerRef = useRef(null);
  const [riceLayer, setRiceLayer] = useState();
  const [maizeLayer, setMaizeLayer] = useState();
  const [sugarcaneLayer, setSugarcaneLayer] = useState();
  const [cassavaLayer, setCassavaLayer] = useState();

  const hotspotChartOptions = {
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

  const cropTypeAreaChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Area each crop type in and around the area',
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
        text: 'Irrigation Office of Each Crop Area',
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
          return value > 0; // display labels with a value greater than 0
        },
      },
    },
  };

  const qolIndexChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Quality of Life Index',
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
          return value;
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
      if (overlay) {
        map.Overlays.remove(overlay);
        setOverlay();
      }
      if (riceLayer) {
        map.Layers.remove(riceLayer);
        setRiceLayer();
      }
      if (maizeLayer) {
        map.Layers.remove(maizeLayer);
        setMaizeLayer();
      }
      if (sugarcaneLayer) {
        map.Layers.remove(sugarcaneLayer);
        setSugarcaneLayer();
        if (cassavaLayer) {
          map.Layers.remove(cassavaLayer);
          setCassavaLayer();
        }
      }
    }
  }, [showResult]);

  const fetchDataByQuery = (query, setData) => {
    fetchData({
      query,
      setData,
    });
  };

  const handleSearchButton = () => {
    resetDotCount();
    setIsLoading(true);

    let coordQuery = '';
    let cropQueries = [];

    if (subDistrict !== 0) {
      coordQuery = `data=thai_coord&select=lat,long&where=ta_id='${subDistrict}'`;
      cropQueries = [
        `data=rice_2023${getMonth()}${getLastCropDate()}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai)) AS features&where=data_date = '${getLastDateCrop()}' AND t_code='${subDistrict}') AS subquery`,
        `data=maize_2023${getMonth()}${getLastCropDate()}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai)) AS features&where=data_date = '${getLastDateCrop()}' AND t_code='${subDistrict}') AS subquery`,
        `data=sugarcane_2023${getMonth()}${getLastCropDate()}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai)) AS features&where=data_date = '${getLastDateCrop()}' AND t_code='${subDistrict}') AS subquery`,
        `data=cassava_2023${getMonth()}${getLastCropDate()}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai)) AS features&where=data_date = '${getLastDateCrop()}' AND t_code='${subDistrict}') AS subquery`,
      ];
    } else if (district !== 0) {
      coordQuery = `data=thai_coord&select=lat,long&where=am_id='${district}'`;
      cropQueries = [
        `data=rice_2023${getMonth()}${getLastCropDate()}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${getLastDateCrop()}' AND a_code='${district}') AS subquery`,
        `data=maize_2023${getMonth()}${getLastCropDate()}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${getLastDateCrop()}' AND a_code='${district}') AS subquery`,
        `data=sugarcane_2023${getMonth()}${getLastCropDate()}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${getLastDateCrop()}' AND a_code='${district}') AS subquery`,
        `data=cassava_2023${getMonth()}${getLastCropDate()}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${getLastDateCrop()}' AND a_code='${district}') AS subquery`,
      ];
    } else {
      coordQuery = `data=thai_coord&select=lat,long&where=ch_id='${province}'`;
      cropQueries = [
        `data=rice_2023${getMonth()}${getLastCropDate()}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${getLastDateCrop()}' AND p_code='${province}') AS subquery`,
        `data=maize_2023${getMonth()}${getLastCropDate()}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${getLastDateCrop()}' AND p_code='${province}') AS subquery`,
        `data=sugarccane_2023${getMonth()}${getLastCropDate()}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${getLastDateCrop()}' AND p_code='${province}') AS subquery, data=cassava_2023${getMonth()}${getLastCropDate()}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${getLastDateCrop()}' AND p_code='${province}') AS subquery`,
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

  function handleDraw(geom) {
    const cropNames = ['rice', 'maize', 'sugarcane', 'cassava'];
    const month = getMonth();
    const lastCropDate = getLastCropDate();
    const lastDateCrop = getLastDateCrop();

    cropNames.forEach((cropName) => {
      const query = `data=${cropName}_2023${month}${lastCropDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('rai', rai, 'office_cod', office_cod)) AS features&where=data_date = '${lastDateCrop}' AND ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
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
    setRiceArea(0);
    setMaizeArea(0);
    setSugarcaneArea(0);
    setCassavaArea(0);
    setDrawArea(0);
    setDotCount(0);
    resetDotCount();
    setIsLoading(false);
    setShowResult(false);
    if (overlay) {
      map.Overlays.remove(overlay);
      setOverlay();
    }
    if (riceLayer) {
      map.Layers.remove(riceLayer);
      setRiceLayer();
    }
    if (maizeLayer) {
      map.Layers.remove(maizeLayer);
      setMaizeLayer();
    }
    if (sugarcaneLayer) {
      map.Layers.remove(sugarcaneLayer);
      setSugarcaneLayer();
      if (cassavaLayer) {
        map.Layers.remove(cassavaLayer);
        setCassavaLayer();
      }
    }
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

    setOverlay(shape);
    map.Overlays.add(shape);
    setDotCount(countDot(getDots(), shape));

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
      map.bound(zoomTemp, { padding: { top: pt, bottom: pb } });
      map.Event.bind(sphere.EventName.LayerChange, function () {});
    } else {
      console.log('No valid coordinates found.');
    }
  }, [coordinates]);

  useEffect(() => {
    if (riceData) {
      try {
        setRiceArea(
          turf.area(riceData.result[0].feature_collection) * 0.000625
        );
        countCropIrrOffice(
          riceData.result[0].feature_collection.features,
          riceIrrOfficeCount
        );
      } catch (error) {
        setIsLoading(false);
      }
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
              'fill-color': '#56c0c0',
              'fill-opacity': 0.5,
            },
          },
        ],
      });
      setRiceLayer(layer_crop_rice);
      map.Layers.add(layer_crop_rice);
      setIsLoading(false);
      setShowResult(true);
    }
  }, [riceData]);

  useEffect(() => {
    if (maizeData) {
      try {
        setMaizeArea(
          turf.area(maizeData.result[0].feature_collection) * 0.000625
        );
        countCropIrrOffice(
          maizeData.result[0].feature_collection.features,
          maizeIrrOfficeCount
        );
      } catch (error) {
        setIsLoading(false);
      }
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
              'fill-color': '#fbc740',
              'fill-opacity': 0.5,
            },
          },
        ],
      });
      setMaizeLayer(layer_crop_maize);
      map.Layers.add(layer_crop_maize);
      setIsLoading(false);
      setShowResult(true);
    }
  }, [maizeData]);

  useEffect(() => {
    if (sugarcaneData) {
      try {
        setSugarcaneArea(
          turf.area(sugarcaneData.result[0].feature_collection) * 0.000625
        );
        countCropIrrOffice(
          sugarcaneData.result[0].feature_collection.features,
          sugarcaneIrrOfficeCount
        );
      } catch (error) {
        setIsLoading(false);
      }
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
              'fill-color': '#fba046',
              'fill-opacity': 0.5,
            },
          },
        ],
      });
      setSugarcaneLayer(layer_crop_sugarcane);
      map.Layers.add(layer_crop_sugarcane);
      setIsLoading(false);
      setShowResult(true);
    }
  }, [sugarcaneData]);

  useEffect(() => {
    if (cassavaData) {
      try {
        setCassavaArea(
          turf.area(cassavaData.result[0].feature_collection) * 0.000625
        );
        countCropIrrOffice(
          cassavaData.result[0].feature_collection.features,
          cassavaIrrOfficeCount
        );
      } catch (error) {
        setIsLoading(false);
      }
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
              'fill-color': '#fb6584',
              'fill-opacity': 0.5,
            },
          },
        ],
      });
      setCassavaLayer(layer_crop_cassava);
      map.Layers.add(layer_crop_cassava);
      setIsLoading(false);
      setShowResult(true);
    }
  }, [cassavaData]);

  useEffect(() => {
    const handleDrawCreate = (e) => {
      if (e.features && e.features[0].geometry.coordinates.length === 1) {
        setIsLoading(true);
        setShowResult(false);
        handleDraw(e.features[0].geometry);
        setDrawArea(turf.area(e.features[0]));
        let count = 0;
        resetDotCount();
        for (let i = 0; i < e.features[0].geometry.coordinates.length; i++) {
          const coord = e.features[0].geometry.coordinates[i];
          let outputArray = [];
          for (let j = 0; j < coord.length; j++) {
            const [lon, lat] = coord[j];
            const obj = { lon, lat };
            outputArray.push(obj);
          }
          const geom = new sphere.Polygon(outputArray);
          const dots = getDots();
          count += countDot(dots, geom);
        }
        setDotCount(count);
      } else {
        setIsLoading(true);
        setShowResult(false);
        handleDraw(e.createdFeatures[0].geometry);
        setDrawArea(turf.area(e.createdFeatures[0]));
        let count = 0;
        resetDotCount();
        for (
          let i = 0;
          i < e.createdFeatures[0].geometry.coordinates.length;
          i++
        ) {
          let outputArray = [];
          const coord = e.createdFeatures[0].geometry.coordinates[i][0];
          for (let j = 0; j < coord.length; j++) {
            const [lon, lat] = coord[j];
            const obj = { lon, lat };
            outputArray.push(obj);
          }
          const geom = new sphere.Polygon(outputArray);
          const dots = getDots();
          count += countDot(dots, geom);
        }
        setDotCount(count);
      }
    };

    const handleUpdate = (e) => {
      if (e.features[0].geometry.coordinates.length === 1) {
        setIsLoading(true);
        setShowResult(false);
        handleDraw(e.features[0].geometry);
        setDrawArea(turf.area(e.features[0]));
        let count = 0;
        resetDotCount();
        for (let i = 0; i < e.features[0].geometry.coordinates.length; i++) {
          let outputArray = [];
          const coord = e.features[0].geometry.coordinates[i];
          for (let j = 0; j < coord.length; j++) {
            const [lon, lat] = coord[j];
            const obj = { lon, lat };
            outputArray.push(obj);
          }
          const geom = new sphere.Polygon(outputArray);
          const dots = getDots();
          count += countDot(dots, geom);
        }
        setDotCount(count);
      } else {
        setIsLoading(true);
        setShowResult(false);
        handleDraw(e.features[0].geometry);
        setDrawArea(turf.area(e.features[0]));
        let count = 0;
        resetDotCount();
        for (let i = 0; i < e.features[0].geometry.coordinates.length; i++) {
          let outputArray = [];
          const coord = e.features[0].geometry.coordinates[i][0];
          for (let j = 0; j < coord.length; j++) {
            const [lon, lat] = coord[j];
            const obj = { lon, lat };
            outputArray.push(obj);
          }
          const geom = new sphere.Polygon(outputArray);
          const dots = getDots();
          count += countDot(dots, geom);
        }
        setDotCount(count);
      }
    };

    const handleDrawDelete = (e) => {
      setRiceArea(0);
      setMaizeArea(0);
      setSugarcaneArea(0);
      setCassavaArea(0);
      setDrawArea(0);
      setDotCount(0);
      resetDotCount();
      setIsLoading(false);
      setShowResult(false);
    };

    if (map) {
      map.Renderer.on('draw.create', handleDrawCreate);
      map.Renderer.on('draw.delete', handleDrawDelete);
      map.Renderer.on('draw.combine', handleDrawCreate);
      map.Renderer.on('draw.update', handleUpdate);
    }

    // return () => {
    //   if (map) {
    //     map.Renderer.off('draw.create', handleDrawCreate);
    //     map.Renderer.off('draw.delete', handleDrawDelete);
    //     map.Renderer.off('draw.combine', handleDrawCreate);
    //     map.Renderer.off('draw.update', handleUpdate);
    //   }
    // };
  }, [map, setDrawArea, setDotCount, getDots]);

  const landUseData = {
    labels: [
      t('landUse.นาข้าว'),
      t('landUse.ข้าวโพดและไร่หมุนเวียน'),
      t('landUse.อ้อย'),
      t('landUse.เกษตรอื่น ๆ'),
      t('landUse.พื้นที่ป่า'),
      t('landUse.อื่น ๆ'),
    ],
    datasets: [
      {
        label: t('amountHotspotInLandType'),
        data: [
          riceCount,
          maizeCount,
          sugarcaneCount,
          otherCropCount,
          forestAreaCount,
          otherCount,
        ],
        backgroundColor: [
          '#56c0c0',
          '#fbce5c',
          '#fba046',
          '#fb6584',
          '#9c63fd',
          '#48a1e9',
        ],
        borderWidth: 0,
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
        backgroundColor: ['#56c0c0', '#fbce5c', '#fba046', '#fb6584'],
        borderWidth: 0,
      },
    ],
  };

  const cropTypes = [
    {
      label: t('crop.rice'),
      data: riceIrrOfficeCount,
      backgroundColor: '#56c0c0',
      stack: 0,
    },
    {
      label: t('crop.maize'),
      data: maizeIrrOfficeCount,
      backgroundColor: '#fbce5c',
      stack: 1,
    },
    {
      label: t('crop.sugarcane'),
      data: sugarcaneIrrOfficeCount,
      backgroundColor: '#fba046',
      stack: 2,
    },
    {
      label: t('crop.cassava'),
      data: cassavaIrrOfficeCount,
      backgroundColor: '#fb6584',
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

  return (
    <>
      {showResult ? (
        <div className='flex flex-col w-full space-y-4'>
          <div>
            <ThemeProvider theme={buttonTheme}>
              <Button
                variant='contained'
                startIcon={<ArrowBackIosIcon />}
                onClick={() => setShowResult(false)}
              >
                {t('back')}
              </Button>
            </ThemeProvider>
          </div>
          <h1 className='font-kanit text-[#212121] dark:text-white text-xl'>
            {drawArea > 0 && (
              <>
                {t('area')}:{' '}
                {drawArea.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                {t('sqm')}
              </>
            )}
          </h1>
          {dotCount > 0 && (
            <>
              <h1 className='font-kanit text-[#212121] dark:text-white text-xl'>
                {dotCount > 0 && (
                  <>
                    {t('amountHotspotInLandType')}: {dotCount}{' '}
                    {t('spot').toLowerCase()}
                    {dotCount > 1 && i18n.language === 'en' ? 's' : ''}
                  </>
                )}
              </h1>
              <div className='flex justify-center'>
                <div className='w-4/6'>
                  <Doughnut data={landUseData} options={hotspotChartOptions} />
                </div>
              </div>
            </>
          )}
          {(riceArea > 0 ||
            maizeArea > 0 ||
            sugarcaneArea > 0 ||
            cassavaArea > 0) && (
            <>
              <h1 className='font-kanit text-[#212121] dark:text-white text-xl'>
                พื้นที่เพาะปลูก:{' '}
                {(riceArea + maizeArea + sugarcaneArea + cassavaArea)
                  .toFixed(3)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                {t('rai')}
              </h1>
              <div className='flex flex-col justify-center'>
                <Bar
                  data={cropAreaData}
                  options={cropTypeAreaChartOptions}
                  title=''
                />
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
                  <InputLabel id='demo-simple-select-label'>
                    {t('province')}
                  </InputLabel>
                  <Select
                    id='province'
                    value={province}
                    label={t('province')}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      setDistrict(0);
                      setSubDistrict(0);
                    }}
                    disabled={isLoading ? true : false}
                  >
                    {provinceList.map((province) => (
                      <MenuItem key={province.ch_id} value={province.ch_id}>
                        {i18n.language === 'th'
                          ? province.changwat_t.replace('จ.', '')
                          : province.changwat_e}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth variant='filled'>
                  <InputLabel id='demo-simple-select-label'>
                    {t('district')}
                  </InputLabel>
                  <Select
                    id='district'
                    value={district}
                    label={t('district')}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setSubDistrict(0);
                    }}
                    disabled={isLoading ? true : false}
                  >
                    <MenuItem key={0} value={0}>
                      {t('all')}
                    </MenuItem>
                    {districtList.map(
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
                    disabled={!district || isLoading ? true : false}
                  >
                    <MenuItem key={0} value={0}>
                      {t('all')}
                    </MenuItem>
                    {subDistrictList.map(
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
                    {isLoading ? 'กำลังวิเคราะห์' : 'เริ่มวิเคราะห์'}
                  </Button>
                  <div className='absolute top-0 left-0 flex items-center justify-center w-full h-full'>
                    {isLoading && <CircularProgress />}
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
                      ยกเลิกการวิเคราะห์
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

  function resetDotCount() {
    riceCount =
      maizeCount =
      sugarcaneCount =
      otherCropCount =
      forestAreaCount =
      otherCount =
        0;
  }

  function countDot(dots, geom) {
    let count = 0;
    dots.forEach((dot) => {
      if (geom.contains(dot)) {
        count++;
        let data = dot._geojson.properties.data;
        if (data === 'A101') {
          riceCount++;
        } else if (data === 'A202') {
          maizeCount++;
        } else if (data === 'A203') {
          sugarcaneCount++;
        } else if (data === 'A999') {
          otherCropCount++;
        } else if (data === 'F000') {
          forestAreaCount++;
        } else if (data === 'O000') {
          otherCount++;
        }
      }
    });
    return count;
  }

  function countCropIrrOffice(data, targetArray) {
    data.forEach((d) => {
      if (d.properties.office_cod) {
        targetArray[parseInt(d.properties.office_cod) - 1]++;
      }
    });
  }
}
