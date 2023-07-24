import React, { useEffect, useRef, useState } from 'react';

import axios from 'axios';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Bar, Doughnut, Line, PolarArea } from 'react-chartjs-2';
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
    mode: localStorage.getItem('theme'),
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
    mode: localStorage.getItem('theme'),
    primary: {
      main: '#F390B0',
      dark: '#FF99BA',
      contrastText: '#ffffff',
    },
    secondary: {
      main:
        localStorage.getItem('theme') === 'dark'
          ? '#fff'
          : '#212121',
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
  localStorage.getItem('theme') === 'dark' ? '#fff' : '#212121';
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
        fontColor: '#fff',
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
    scales: {
      y: {
        title: {
          display: true,
          text: t('spot'),
        },
      },
      x: {
        title: {
          display: true,
          text: t('date'),
        },
      },
    },
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
    maintainAspectRatio: false,
    scales: {
      y: {
        title: {
          display: true,
          text: t('rai'),
        },
      },
      x: {
        title: {
          display: true,
          text: t('cropType'),
        },
      },
    },
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

  const cropPercentageChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: t('luPercentage'),
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
          return value + '%';
        },
      },
    },
  };

  const riceAgeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: {
          display: true,
          text: t('rai'),
        },
      },
      x: {
        title: {
          display: true,
          text: t('ricePlantedDate'),
        },
      },
    },
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
    scales: {
      y: {
        title: {
          display: true,
          text: t('rai'),
        },
      },
      x: {
        title: {
          display: true,
          text: t('maizePlantedDate'),
        },
      },
    },
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
    scales: {
      y: {
        title: {
          display: true,
          text: t('rai'),
        },
      },
      x: {
        title: {
          display: true,
          text: t('plantedDate'),
        },
      },
    },
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
    scales: {
      y: {
        title: {
          display: true,
          text: t('rai'),
        },
      },
      x: {
        title: {
          display: true,
          text: t('plantedDate'),
        },
      },
    },
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
    scales: {
      y: {
        title: {
          display: true,
          text: t('irrOffice'),
        },
      },
      x: {
        title: {
          display: true,
          text: t('percentage'),
        },
      },
    },
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

  const luName = {
    A101: t('landUse.rice'),
    A202: t('landUse.maize'),
    A203: t('landUse.sugarcane'),
    A999: t('landUse.otherCrop'),
    F000: t('landUse.forest'),
    O000: t('landUse.other'),
  };

  const agriName = {
    A0102: t('crop.rice'),
    A0203: t('crop.maize'),
    A0204: t('crop.sugarcane'),
    A0205: t('crop.cassava'),
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
    }, 5000);
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

      hotspotQuery = `data=hotspot_2023${month}&select=latitude,longitude,lu_hp,pv_tn,ap_tn,tb_tn,pv_en,ap_en,tb_en,pv_idn,th_date,th_time,village,confidence&where=acq_date BETWEEN '${from1}' AND '${to1}' AND TO_BE_REPLACED UNION ALL SELECT latitude,longitude,lu_hp,pv_tn,ap_tn,tb_tn,pv_en,ap_en,tb_en,pv_idn,th_date,th_time,village,confidence FROM hotspot_2023${month} where acq_date BETWEEN '${from2}' AND '${to2}' AND TO_BE_REPLACED`;
    } else {
      const from = getDate().subtract(15, 'day').format('DD-MM-YY');
      const to = getDate().format('DD-MM-YY');

      hotspotQuery = `data=hotspot_2023${month}&select=latitude,longitude,lu_hp,pv_tn,ap_tn,tb_tn,pv_en,ap_en,tb_en,pv_idn,th_date,th_time,village,confidence&where=acq_date BETWEEN '${from}' AND '${to}' AND TO_BE_REPLACED`;
    }

    if (subDistrict !== 0) {
      coordQuery = `data=thai_coord&select=lat,long&where=ta_id='${subDistrict}'`;
      hotspotQuery = hotspotQuery.replaceAll(
        'TO_BE_REPLACED',
        `tb_idn='${subDistrict}'`
      );
      cropQueries = [
        `data=rice_2023${month}${lastCropDate}&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod, 'p_name', p_name, 'a_name', a_name, 't_name', t_name, 'start_date', start_date, 'crop_type', crop_type, 'proj_name', proj_name)) AS features&where=data_date = '${lastDateCrop}' AND t_code='${subDistrict}') AS subquery`,
        `data=maize_2023${month}${lastCropDate}&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod, 'p_name', p_name, 'a_name', a_name, 't_name', t_name, 'start_date', start_date, 'crop_type', crop_type, 'proj_name', proj_name)) AS features&where=data_date = '${lastDateCrop}' AND t_code='${subDistrict}') AS subquery`,
        `data=sugarcane_2023${month}${lastCropDate}&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod, 'p_name', p_name, 'a_name', a_name, 't_name', t_name, 'start_date', start_date, 'crop_type', crop_type, 'proj_name', proj_name)) AS features&where=data_date = '${lastDateCrop}' AND t_code='${subDistrict}') AS subquery`,
        `data=cassava_2023${month}${lastCropDate}&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod, 'p_name', p_name, 'a_name', a_name, 't_name', t_name, 'start_date', start_date, 'crop_type', crop_type, 'proj_name', proj_name)) AS features&where=data_date = '${lastDateCrop}' AND t_code='${subDistrict}') AS subquery`,
      ];
    } else if (district !== 0) {
      coordQuery = `data=thai_coord&select=lat,long&where=am_id='${district}'`;
      hotspotQuery = hotspotQuery.replaceAll(
        'TO_BE_REPLACED',
        `ap_idn='${district}'`
      );
      cropQueries = [
        `data=rice_2023${month}${lastCropDate}&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod, 'p_name', p_name, 'a_name', a_name, 't_name', t_name, 'start_date', start_date, 'crop_type', crop_type, 'proj_name', proj_name)) AS features&where=data_date = '${lastDateCrop}' AND a_code='${district}') AS subquery`,
        `data=maize_2023${month}${lastCropDate}&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod, 'p_name', p_name, 'a_name', a_name, 't_name', t_name, 'start_date', start_date, 'crop_type', crop_type, 'proj_name', proj_name)) AS features&where=data_date = '${lastDateCrop}' AND a_code='${district}') AS subquery`,
        `data=sugarcane_2023${month}${lastCropDate}&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod, 'p_name', p_name, 'a_name', a_name, 't_name', t_name, 'start_date', start_date, 'crop_type', crop_type, 'proj_name', proj_name)) AS features&where=data_date = '${lastDateCrop}' AND a_code='${district}') AS subquery`,
        `data=cassava_2023${month}${lastCropDate}&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod, 'p_name', p_name, 'a_name', a_name, 't_name', t_name, 'start_date', start_date, 'crop_type', crop_type, 'proj_name', proj_name)) AS features&where=data_date = '${lastDateCrop}' AND a_code='${district}') AS subquery`,
      ];
    } else {
      coordQuery = `data=thai_coord&select=lat,long&where=ch_id='${province}'`;
      hotspotQuery = hotspotQuery.replaceAll(
        'TO_BE_REPLACED',
        `pv_idn='${province}'`
      );
      cropQueries = [
        `data=rice_2023${month}${lastCropDate}&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod, 'p_name', p_name, 'a_name', a_name, 't_name', t_name, 'start_date', start_date, 'crop_type', crop_type, 'proj_name', proj_name)) AS features&where=data_date = '${lastDateCrop}' AND p_code='${province}') AS subquery`,
        `data=maize_2023${month}${lastCropDate}&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod, 'p_name', p_name, 'a_name', a_name, 't_name', t_name, 'start_date', start_date, 'crop_type', crop_type, 'proj_name', proj_name)) AS features&where=data_date = '${lastDateCrop}' AND p_code='${province}') AS subquery`,
        `data=sugarcane_2023${month}${lastCropDate}&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod, 'p_name', p_name, 'a_name', a_name, 't_name', t_name, 'start_date', start_date, 'crop_type', crop_type, 'proj_name', proj_name)) AS features&where=data_date = '${lastDateCrop}' AND p_code='${province}') AS subquery`,
        `data=cassava_2023${month}${lastCropDate}&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod, 'p_name', p_name, 'a_name', a_name, 't_name', t_name, 'start_date', start_date, 'crop_type', crop_type, 'proj_name', proj_name)) AS features&where=data_date = '${lastDateCrop}' AND p_code='${province}') AS subquery`,
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

  const handleDraw = (geom) => {
    document.getElementById('page2').click();
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

      hotspotQuery = `data=hotspot_2023${month}&select=latitude,longitude,lu_hp,pv_tn,ap_tn,tb_tn,pv_en,ap_en,tb_en,pv_idn,th_date,th_time,village,confidence&where=acq_date BETWEEN '${from1}' AND '${to1}' AND ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
        geom
      )}'), 4326), ST_SetSRID(ST_MakePoint(longitude, latitude), 4326))UNION ALL SELECT latitude,longitude,lu_hp,pv_tn,ap_tn,tb_tn,pv_en,ap_en,tb_en,pv_idn,th_date,th_time,village,confidence FROM hotspot_2023${month} where acq_date BETWEEN '${from2}' AND '${to2}' AND ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
        geom
      )}'), 4326), ST_SetSRID(ST_MakePoint(longitude, latitude), 4326))`;
    } else {
      const from = getDate().subtract(15, 'day').format('DD-MM-YY');
      const to = getDate().format('DD-MM-YY');

      hotspotQuery = `data=hotspot_2023${month}&select=latitude,longitude,lu_hp,pv_tn,ap_tn,tb_tn,pv_en,ap_en,tb_en,pv_idn,th_date,th_time,village,confidence&where=acq_date BETWEEN '${from}' AND '${to}' AND ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
        geom
      )}'), 4326), ST_SetSRID(ST_MakePoint(longitude, latitude), 4326))`;
    }

    fetchData({
      query: hotspotQuery,
      setData: setHotspotData,
    });

    cropNames.forEach((cropName) => {
      const query = `data=${cropName}_2023${month}${lastCropDate}&select=json_agg(features) AS features FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend, 'rai', rai, 'office_cod', office_cod, 'p_name', p_name, 'a_name', a_name, 't_name', t_name, 'start_date', start_date, 'crop_type', crop_type, 'proj_name', proj_name)) AS features&where=data_date = '${lastDateCrop}' AND ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
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
  };

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
    setRiceData(null);
    setMaizeData(null);
    setSugarcaneData(null);
    setCassavaData(null);
    setHotspotData(null);
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

      setDrawArea(shape.size());

      const pt = district !== 0 ? 200 : 125;
      const pb = district !== 0 ? 200 : 125;
      map.Overlays.add(shape);
      map.bound(zoomTemp, { padding: { top: pt, bottom: pb } });
    } else {
      console.log('No valid coordinates found.');
    }
  }, [coordinates]);

  useEffect(() => {
    if (!(riceData && riceData.result[0].features)) return;
    setTimeout(() => {
      const geojson = {
        type: 'FeatureCollection',
        features: riceData.result[0].features,
      };
      setRiceArea(turf.area(geojson) / 1600);
      countCropIrrOffice(riceData.result[0].features, riceIrrOfficeCount);
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
    }, 1000);
  }, [riceData]);

  useEffect(() => {
    if (!(maizeData && maizeData.result[0].features)) return;
    setTimeout(() => {
      const geojson = {
        type: 'FeatureCollection',
        features: maizeData.result[0].features,
      };
      setMaizeArea(turf.area(geojson) / 1600);
      countCropIrrOffice(maizeData.result[0].features, maizeIrrOfficeCount);
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
    }, 1000);
  }, [maizeData]);

  useEffect(() => {
    if (!(sugarcaneData && sugarcaneData.result[0].features)) return;
    setTimeout(() => {
      const geojson = {
        type: 'FeatureCollection',
        features: sugarcaneData.result[0].features,
      };
      setSugarcaneArea(turf.area(geojson) / 1600);
      countCropIrrOffice(
        sugarcaneData.result[0].features,
        sugarcaneIrrOfficeCount
      );
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
    }, 1000);
  }, [sugarcaneData]);

  useEffect(() => {
    if (!(cassavaData && cassavaData.result[0].features)) return;
    setTimeout(() => {
      const geojson = {
        type: 'FeatureCollection',
        features: cassavaData.result[0].features,
      };
      setCassavaArea(turf.area(geojson) / 1600);
      countCropIrrOffice(cassavaData.result[0].features, cassavaIrrOfficeCount);
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
    }, 1000);
  }, [cassavaData]);

  useEffect(() => {
    if (!hotspotData) return;
    hotspotData.result.forEach((hotspot) => {
      switch (hotspot.lu_hp) {
        case 'A101':
          hotspotRiceCount += 1;
          break;
        case 'A202':
          hotspotMaizeCount += 1;
          break;
        case 'A203':
          hotspotSugarcaneCount += 1;
          break;
        case 'A999':
          hotspotOtherCropCount += 1;
          break;
        case 'F000':
          hotspotForestCount += 1;
          break;
        case 'O000':
          hotspotOtherCount += 1;
          break;
        default:
          break;
      }
    });

    let layer_hotspot = new sphere.Layer({
      sources: {
        hotspot_analysis_src: {
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
            }),
          },
        },
      },
      layers: [
        {
          id: 'layer_hotspot_heat_analysis',
          type: 'heatmap',
          source: 'hotspot_analysis_src',
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
          id: 'layer_hotspot_point_analysis',
          type: 'circle',
          source: 'hotspot_analysis_src',
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
    map.Layers.add(layer_hotspot);
  }, [hotspotData]);

  map.Event.bind(sphere.EventName.Click, function (location) {
    const baseEps = 0.001;
    const zoomDifference = 14.5 - map.zoom();
    const eps = baseEps * Math.pow(2, zoomDifference);
    hotspotData?.result.forEach((hotspot) => {
      if (
        Math.abs(location.lon - parseFloat(hotspot.longitude)) < eps &&
        Math.abs(location.lat - parseFloat(hotspot.latitude)) < eps
      ) {
        const popup = new sphere.Popup(
          { lon: hotspot.longitude, lat: hotspot.latitude },
          {
            loadDetail: (element) =>
              popupHotspotDetail(element, hotspot, location),
            size: { width: 300 },
            closable: true,
          }
        );
        map.Overlays.add(popup);
      }
    });
    const cropDataArray = [riceData, maizeData, sugarcaneData, cassavaData];
    cropDataArray.forEach((cropData) => {
      cropData?.result[0].features?.forEach((feature) => {
        if (
          turf.booleanPointInPolygon(
            turf.point([location.lon, location.lat]),
            feature.geometry
          )
        ) {
          const popup = new sphere.Popup(
            { lon: location.lon, lat: location.lat },
            {
              loadDetail: (element) =>
                popupCropDetail(element, feature, location),
              size: { width: 300 },
              closable: true,
            }
          );
          map.Overlays.add(popup);
        }
      });
    });
  });

  const popupHotspotDetail = (element, hotspot, location) => {
    element.className = 'popup-container';
    element.innerHTML = `<div class="popup-title">${t(
      'hotspot'
    )}</div><span class="popup-title popup-title-highlight">${
      luName[hotspot.lu_hp]
    }</span>
<div class="popup-detail"><span class="popup-detail-highlight">${t(
      'date'
    )}: </span>${dayjs(hotspot.th_date, 'DD-MM-YY').format('DD/MM/YYYY')}
              <span class="popup-detail-highlight">${t('time')}: </span>${
      String(hotspot.th_time).length === 4
        ? String(hotspot.th_time).slice(0, 2) +
          ':' +
          String(hotspot.th_time).slice(2, 4)
        : '0' +
          String(hotspot.th_time).slice(0, 1) +
          ':' +
          String(hotspot.th_time).slice(1, 3)
    }
              <span class="popup-detail-highlight">${t('province')}: </span>${
      i18n.language === 'th' ? hotspot.pv_tn : hotspot.pv_en
    }
              <span class="popup-detail-highlight">${t('district')}: </span>${
      i18n.language === 'th' ? hotspot.ap_tn : hotspot.ap_en
    }
              <span class="popup-detail-highlight">${t(
                'subDistrict'
              )}: </span>${
      i18n.language === 'th' ? hotspot.tb_tn : hotspot.tb_en
    }
              <span class="popup-detail-highlight">${t('village')}: </span>${
      hotspot.village ? hotspot.village : '-'
    }
              <span class="popup-detail-highlight">${t('confidence')}: </span>${
      hotspot.confidence
    }
              <span class="popup-detail-highlight">${t('lat')}: </span>${
      hotspot.latitude
    }
              <span class="popup-detail-highlight">${t('lon')}: </span>${
      hotspot.longitude
    }
          </div>`;
  };

  const popupCropDetail = (element, feature, location) => {
    element.className = 'popup-container';
    element.innerHTML = `<div class="popup-title">${t(
      'cropType'
    )}</div><span class="popup-title popup-title-highlight">${
      agriName[feature.properties.crop_type]
    }</span>
<div class="popup-detail"><span class="popup-detail-highlight">${t(
      'plantedDate'
    )}</span>${
      ': ' +
      dayjs(feature.properties.start_date, 'YYYY-MM-DD').format('DD/MM/YYYY')
    }
                <span class="popup-detail-highlight">${t('rai')}: </span>${
      feature.properties.rai
    }
                <span class="popup-detail-highlight">${t('province')}: </span>${
      feature.properties.p_name
    }
                <span class="popup-detail-highlight">${t('district')}: </span>${
      feature.properties.a_name
    }
                <span class="popup-detail-highlight">${t(
                  'subDistrict'
                )}: </span>${feature.properties.t_name}
                <span class="popup-detail-highlight">${t('project')}: </span>${
      feature.properties.proj_name ? feature.properties.proj_name : '-'
    }
                <span class="popup-detail-highlight">${t(
                  'irr_office'
                )}: </span>${
      feature.properties.office_cod ? feature.properties.office_cod : '-'
    }
                <span class="popup-detail-highlight">${t('lat')}: </span>${
      location.lat
    }
                <span class="popup-detail-highlight">${t('lon')}: </span>${
      location.lon
    }
              </div>`;
  };

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
      setRiceData(null);
      setMaizeData(null);
      setSugarcaneData(null);
      setCassavaData(null);
      setHotspotData(null);
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

  const calcLinReg = (landUseData) => {
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
  };

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
    labels: getFortnightRange(getDate(), 8).map(
      (fortnight, index) => `${fortnight} (${(8 - index) * 2} ${t('week')})`
    ),
    datasets: [
      {
        label: t('crop.rice'),
        data: Array.from(
          {
            length: 8,
          },
          (_, i) =>
            riceData?.result[0].features?.reduce(
              (sum, item) =>
                item.properties.legend === i + 1
                  ? Number((sum + item.properties.rai).toFixed(3))
                  : sum,
              0
            )
        ),
        backgroundColor: riceAgeColor,
      },
    ],
  };
  const tempDate = getFortnightRange(getDate().add(3, 'month'), 8);
  const maizeAgeData = {
    labels: getFortnightRange(getDate(), 8).map(
      (fortnight, index) => `${fortnight} (${tempDate[index]})`
    ),
    datasets: [
      {
        label: t('crop.maize'),
        data: Array.from(
          {
            length: 8,
          },
          (_, i) =>
            maizeData?.result[0].features?.reduce(
              (sum, item) =>
                item.properties.legend === i
                  ? Number((sum + item.properties.rai).toFixed(3))
                  : sum,
              0
            )
        ),
        backgroundColor: maizeAgeColor,
      },
    ],
  };

  const sugarcaneAgeData = {
    labels: getFortnightRange(getDate(), 24),
    datasets: [
      {
        label: t('crop.sugarcane'),
        data: Array.from(
          {
            length: 24,
          },
          (_, i) =>
            sugarcaneData?.result[0].features?.reduce(
              (sum, item) =>
                item.properties.legend === i + 1
                  ? Number((sum + item.properties.rai).toFixed(3))
                  : sum,
              0
            )
        ),
        backgroundColor: sugarcaneAgeColor,
      },
    ],
  };

  const cassavaAgeData = {
    labels: getFortnightRange(getDate(), 24),
    datasets: [
      {
        label: t('crop.cassava'),
        data: Array.from(
          {
            length: 24,
          },
          (_, i) =>
            cassavaData?.result[0].features?.reduce(
              (sum, item) =>
                item.properties.legend === i + 1
                  ? Number((sum + item.properties.rai).toFixed(3))
                  : sum,
              0
            )
        ),
        backgroundColor: cassavaAgeColor,
      },
    ],
  };

  const cropPercentageData = {
    labels: [
      t('crop.rice'),
      t('crop.maize'),
      t('crop.sugarcane'),
      t('crop.cassava'),
    ],
    datasets: [
      {
        label: '',
        data: Array.from(
          {
            length: 4,
          },
          (_, i) => {
            if (i === 0) {
              return (
                (riceArea /
                  (riceArea + maizeArea + sugarcaneArea + cassavaArea)) *
                100
              ).toFixed(3);
            } else if (i === 1) {
              return (
                (maizeArea /
                  (riceArea + maizeArea + sugarcaneArea + cassavaArea)) *
                100
              ).toFixed(3);
            } else if (i === 2) {
              return (
                (sugarcaneArea /
                  (riceArea + maizeArea + sugarcaneArea + cassavaArea)) *
                100
              ).toFixed(3);
            } else if (i === 3) {
              return (
                (cassavaArea /
                  (riceArea + maizeArea + sugarcaneArea + cassavaArea)) *
                100
              ).toFixed(3);
            }
            return 0;
          }
        ),
        backgroundColor: Object.values(agriColor),
        borderWidth: 0,
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
                id='analysisBackBtn'
                aria-label='back'
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
                onClick={() => window.my_modal.showModal()}
              >
                <AspectRatioIcon />
              </IconButton>
            </ThemeProvider>
          </div>
          <dialog id='my_modal' className='modal'>
            <form
              method='dialog'
              className='modal-box max-w-none space-y-8 bg-[#fff] dark:bg-[#444444]'
            >
              {drawArea > 0 && areaSizeMeasurement(t, drawArea)}
              {hotSpotCountAnalysis(
                t,
                hotspotCount,
                i18n,
                hotspotLuData,
                hotspotChartOptions,
                hotspotHistoryData,
                hotspotHistoryChartOptions,
                percentageChangedRice,
                percentageChangedMaize,
                percentageChangedSugarcane,
                percentageChangedOtherCrop,
                percentageChangedForest,
                percentageChangedOther
              )}
              {CropAreaAnalysis(
                t,
                riceArea,
                maizeArea,
                sugarcaneArea,
                cassavaArea,
                cropAreaData,
                cropTypeAreaChartOptions,
                cropPercentageData,
                cropPercentageChartOptions,
                riceAgeData,
                riceAgeChartOptions,
                maizeAgeData,
                maizeAgeChartOptions,
                sugarcaneAgeData,
                sugarcaneAgeChartOptions,
                cassavaAgeData,
                cassavaAgeChartOptions,
                irr_officeData,
                irrOfficeChartOptions
              )}
              {cropBurnDatePrediction(
                riceArea,
                maizeArea,
                sugarcaneArea,
                cassavaArea,
                riceAgeData,
                maizeAgeData,
                sugarcaneAgeData,
                cassavaAgeData
              )}
            </form>
            <form method='dialog' className='modal-backdrop'>
              <button>close</button>
            </form>
          </dialog>
          {drawArea > 0 && areaSizeMeasurement(t, drawArea)}
          {hotSpotCountAnalysis(
            t,
            hotspotCount,
            i18n,
            hotspotLuData,
            hotspotChartOptions,
            hotspotHistoryData,
            hotspotHistoryChartOptions,
            percentageChangedRice,
            percentageChangedMaize,
            percentageChangedSugarcane,
            percentageChangedOtherCrop,
            percentageChangedForest,
            percentageChangedOther
          )}
          {CropAreaAnalysis(
            t,
            riceArea,
            maizeArea,
            sugarcaneArea,
            cassavaArea,
            cropAreaData,
            cropTypeAreaChartOptions,
            cropPercentageData,
            cropPercentageChartOptions,
            riceAgeData,
            riceAgeChartOptions,
            maizeAgeData,
            maizeAgeChartOptions,
            sugarcaneAgeData,
            sugarcaneAgeChartOptions,
            cassavaAgeData,
            cassavaAgeChartOptions,
            irr_officeData,
            irrOfficeChartOptions
          )}
          {cropBurnDatePrediction(
            riceArea,
            maizeArea,
            sugarcaneArea,
            cassavaArea,
            riceAgeData,
            maizeAgeData,
            sugarcaneAgeData,
            cassavaAgeData
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
}

const resetHotspotCount = () => {
  hotspotRiceCount =
    hotspotMaizeCount =
    hotspotSugarcaneCount =
    hotspotOtherCropCount =
    hotspotForestCount =
    hotspotOtherCount =
      0;
};

const countCropIrrOffice = (data, targetArray) => {
  data.forEach((d) => {
    if (d.properties.office_cod) {
      targetArray[parseInt(d.properties.office_cod) - 1]++;
    }
  });
};

const CropAreaAnalysis = (
  t,
  riceArea,
  maizeArea,
  sugarcaneArea,
  cassavaArea,
  cropAreaData,
  cropTypeAreaChartOptions,
  cropPercentageData,
  cropPercentageChartOptions,
  riceAgeData,
  riceAgeChartOptions,
  maizeAgeData,
  maizeAgeChartOptions,
  sugarcaneAgeData,
  sugarcaneAgeChartOptions,
  cassavaAgeData,
  cassavaAgeChartOptions,
  irr_officeData,
  irrOfficeChartOptions
) => {
  return (
    <>
      <div className='stats shadow bg-[#6fb289] w-full'>
        <div className='stat'>
          <div className='stat-title font-kanit text-white'>
            {t('agriArea')}
          </div>
          {riceArea + maizeArea + sugarcaneArea + cassavaArea > 0 ? (
            <>
              <div className='stat-value text-white'>
                {(riceArea + maizeArea + sugarcaneArea + cassavaArea)
                  .toFixed(3)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                <span className='font-kanit'>{t('rai')}</span>
              </div>
              <div className='stat-desc font-kanit text-gray-100'>
                {t('or')}{' '}
                {((riceArea + maizeArea + sugarcaneArea + cassavaArea) * 1600)
                  .toFixed(3)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                {t('sqm')}
              </div>
            </>
          ) : (
            <div className='stat-value text-white font-kanit'>
              {t('noAgriArea')}
            </div>
          )}
        </div>
      </div>
      <div className='flex flex-col justify-center'>
        {riceArea + maizeArea + sugarcaneArea + cassavaArea > 0 && (
          <div className='h-96'>
            <Bar data={cropAreaData} options={cropTypeAreaChartOptions} />
          </div>
        )}
        {riceArea + maizeArea + sugarcaneArea + cassavaArea > 0 && (
          <div className='h-[500px] w-full'>
            <PolarArea
              data={cropPercentageData}
              options={cropPercentageChartOptions}
            />
          </div>
        )}
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
            <Bar data={sugarcaneAgeData} options={sugarcaneAgeChartOptions} />
          </div>
        )}
        {cassavaArea > 0 && (
          <div className='h-96'>
            <Bar data={cassavaAgeData} options={cassavaAgeChartOptions} />
          </div>
        )}
        {riceArea + maizeArea + sugarcaneArea + cassavaArea > 0 && (
          <div className='h-[1200px]'>
            <Bar data={irr_officeData} options={irrOfficeChartOptions} />
          </div>
        )}
      </div>
    </>
  );
};

const hotSpotCountAnalysis = (
  t,
  hotspotCount,
  i18n,
  hotspotLuData,
  hotspotChartOptions,
  hotspotHistoryData,
  hotspotHistoryChartOptions,
  percentageChangedRice,
  percentageChangedMaize,
  percentageChangedSugarcane,
  percentageChangedOtherCrop,
  percentageChangedForest,
  percentageChangedOther
) => {
  return (
    <>
      <div className='stats shadow bg-[#826954] w-full'>
        <div className='stat'>
          <div className='stat-title font-kanit text-white'>
            {t('amountHotspotInLandType')}
          </div>
          <div className='stat-value text-white'>
            {hotspotCount > 0 ? (
              <>
                {hotspotCount}{' '}
                <span className='font-kanit'>
                  {t('spot').toLowerCase()}
                  {hotspotCount > 1 && i18n.language === 'en' ? 's' : ''}
                </span>
              </>
            ) : (
              <span className='font-kanit'>{t('noHotspot')}</span>
            )}
          </div>
          <div className='stat-desc font-kanit'></div>
        </div>
      </div>
      {hotspotCount > 0 && (
        <>
          <div className='flex justify-center'>
            <div className='h-[500px] w-full'>
              <Doughnut data={hotspotLuData} options={hotspotChartOptions} />
            </div>
          </div>
          <div className='h-[500px]'>
            <Line
              data={hotspotHistoryData}
              options={hotspotHistoryChartOptions}
            />
          </div>
          <div className='stats stats-vertical lg:stats-horizontal shadow w-full'>
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
                  ? (percentageChangedSugarcane.toFixed(2) > 0 ? '↗︎' : '↘︎') +
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
                  ? (percentageChangedOtherCrop.toFixed(2) > 0 ? '↗︎' : '↘︎') +
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
    </>
  );
};

const areaSizeMeasurement = (t, drawArea) => {
  return (
    <>
      <div className='stats shadow bg-[#f7b142] w-full'>
        <div className='stat'>
          <div className='stat-title font-kanit text-white'>{t('area')}</div>
          <div className='stat-value text-white'>
            {drawArea.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
            <span className='font-kanit'>{t('sqm')}</span>
          </div>
          <div className='stat-desc font-kanit text-gray-100'>
            {t('or')}{' '}
            {(drawArea / 1600).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
            {t('rai').toLowerCase()}
          </div>
        </div>
      </div>
    </>
  );
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

const hexToRGBA = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getFortnightRange = (date, range) => {
  if (!date) return;

  const adjust = parseInt(date.format('DD')) > 15 ? 1 : 0;

  const dateRanges = [];
  for (let i = 0; i < range; i++) {
    const startDay = (i + adjust) % 2 === 0 ? 1 : 16;
    const endDay =
      (i + adjust) % 2 === 0
        ? 15
        : dayjs(date)
            .subtract(14 * i, 'day')
            .endOf('month')
            .format('DD');
    const monthYear = dayjs(date)
      .subtract(15 * i, 'day')
      .format('MM/YY');
    dateRanges.push(`${startDay}-${endDay}/${monthYear}`);
  }
  return dateRanges.reverse();
};

const getHarvestDate = (cropData, growthPeriod) => {
  const maxHotspotIndex = cropData.datasets[0].data.indexOf(
    Math.max(...cropData.datasets[0].data)
  );
  if (maxHotspotIndex === -1) return '-';
  const dateLabel = cropData.labels[maxHotspotIndex]?.split(' ')[0];
  return (
    dateLabel?.split('-')[0] +
    '-' +
    dayjs(dateLabel?.split('-')[1], 'DD/MM/YY')
      .add(growthPeriod, 'month')
      .format('DD/MM/YY')
  );
};

const cropBurnDatePrediction = (
  riceArea,
  maizeArea,
  sugarcaneArea,
  cassavaArea,
  riceAgeData,
  maizeAgeData,
  sugarcaneAgeData,
  cassavaAgeData
) => {
  return (
    riceArea + maizeArea + sugarcaneArea + cassavaArea > 0 && (
      <div className='flex justify-center'>
        <div className='stats stats-vertical shadow w-full'>
          <div className={`stat bg-[${agriColor.rice}]`}>
            <div className='stat-title text-white'>
              Date with possible highest heat concentration in rice area
            </div>
            <div className='stat-value text-white'>
              {getHarvestDate(riceAgeData, 4)}
            </div>
            <div className='stat-desc text-gray-100'>
              {riceAgeData.datasets[0].data.indexOf(
                Math.max(...riceAgeData.datasets[0].data)
              ) !== -1 &&
                'Assuming rice takes approximately 4 months to grow and harvest'}
            </div>
          </div>
          <div className={`stat bg-[${agriColor.maize}]`}>
            <div className='stat-title text-white'>
              Date with possible highest heat concentration in maize area
            </div>
            <div className='stat-value text-white'>
              {getHarvestDate(maizeAgeData, 2)}
            </div>
            <div className='stat-desc text-gray-100'>
              {maizeAgeData.datasets[0].data.indexOf(
                Math.max(...maizeAgeData.datasets[0].data)
              ) !== -1 &&
                'Assuming maize takes approximately 2 months to grow and harvest'}
            </div>
          </div>
          <div className={`stat bg-[${agriColor.sugarcane}]`}>
            <div className='stat-title text-white'>
              Date with possible highest heat concentration in sugarcane area
            </div>
            <div className='stat-value text-white'>
              {getHarvestDate(sugarcaneAgeData, 12)}
            </div>
            <div className='stat-desc text-gray-100'>
              {sugarcaneAgeData.datasets[0].data.indexOf(
                Math.max(...sugarcaneAgeData.datasets[0].data)
              ) !== -1 &&
                'Assuming sugarcane takes approximately 12 months to grow and harvest'}
            </div>
          </div>
          <div className={`stat bg-[${agriColor.cassava}]`}>
            <div className='stat-title text-white'>
              Date with possible highest heat concentration in cassava area
            </div>
            <div className='stat-value text-white'>
              {getHarvestDate(cassavaAgeData, 12)}
            </div>
            <div className='stat-desc text-gray-100'>
              {cassavaAgeData.datasets[0].data.indexOf(
                Math.max(...cassavaAgeData.datasets[0].data)
              ) !== -1 &&
                'Assuming cassava takes approximately 12 months to grow and harvest'}
            </div>
          </div>
        </div>
      </div>
    )
  );
};
