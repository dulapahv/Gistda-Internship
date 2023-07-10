import React, { useEffect, useState } from 'react';

import axios from 'axios';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import BorderAllIcon from '@mui/icons-material/BorderAll';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import FormControlLabel from '@mui/material/FormControlLabel';
import BorderClearIcon from '@mui/icons-material/BorderClear';
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { map, sphere } from '../components';
import { TableOverview } from '../components';

const baseURL = 'http://localhost:3001/';

const color = {
  rice: '#56c0c0',
  maize: '#fbce5c',
  sugarcane: '#fba046',
  otherCrop: '#fb6584',
  forest: '#9c63fd',
  other: '#48a1e9',
};

const buttonTheme = createTheme({
  palette: {
    mode: JSON.parse(localStorage.getItem('theme')),
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
    mode: JSON.parse(localStorage.getItem('theme')),
    primary: {
      main: '#F390B0',
    },
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
  },
});

const RadioButtonTheme = createTheme({
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

const datePickerTheme = createTheme({
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

const skeletonTheme = createTheme({
  palette: {
    mode: JSON.parse(localStorage.getItem('theme')),
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
  },
});

const circularProgressTheme = createTheme({
  palette: {
    mode: JSON.parse(localStorage.getItem('theme')),
    primary: {
      main: '#F390B0',
    },
  },
});

const hexToRGBA = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

let dots = [];
let month;
let lastDate;
let tempDateCrop;

export const getMonth = () => month;
export const getLastCropDate = () => lastDate;
export const getLastDateCrop = () => tempDateCrop;
export const getDots = () => dots;

const dotFactory = (
  lat,
  lon,
  lineWidth = 20,
  draggable = false,
  lineColor = color.rice,
  alpha = 0.5,
  land_use = 'rice'
) => {
  const dot = new sphere.Dot(
    {
      lon: lon,
      lat: lat,
    },
    {
      lineWidth: lineWidth,
      draggable: draggable,
      lineColor: hexToRGBA(lineColor, alpha),
      data: land_use,
    }
  );
  dots.push(dot);
  return dot;
};

export default function DetailHotspot() {
  const { t, i18n } = useTranslation();
  const [boundary, setBoundary] = useState(false);
  const [pm25, setPm25] = useState(false);
  const [isHotspotLoaded, setIsHotspotLoaded] = useState(false);
  const [isCropLoaded, setIsCropLoaded] = useState(false);
  const [date, setDate] = React.useState(dayjs('2023-03-06'));
  const [hotspotData, setHotspotData] = useState();
  const [riceData, setRiceData] = useState('');
  const [maizeData, setMaizeData] = useState();
  const [sugarcaneData, setSugarcaneData] = useState();
  const [cassavaData, setCassavaData] = useState();
  const [isCropShowed, setIsCropShowed] = useState(false);
  const [cropType, setCropType] = useState('rice');
  const [isHotspotShowed, setIsHotspotShowed] = useState(true);
  const [lastDateCrop, setLastDateCrop] = useState('2023-03-06');
  const [lastCropType, setLastCropType] = useState('rice');
  const [isRiceLoaded, setIsRiceLoaded] = useState(true);
  const [isMaizeLoaded, setIsMaizeLoaded] = useState(true);
  const [isSugarcaneLoaded, setIsSugarcaneLoaded] = useState(true);
  const [isOtherCropLoaded, setIsOtherCropLoaded] = useState(true);
  const [isForestLoaded, setIsForestLoaded] = useState(true);
  const [isOtherLoaded, setIsOtherLoaded] = useState(true);

  const fetchData = async ({ query, setData, type }) => {
    switch (type) {
      case 1:
        setIsCropLoaded(false);
        break;
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
        switch (type) {
          case 1:
            setIsCropLoaded(true);
            break;
          case 2:
            setIsHotspotLoaded(true);
            break;
          default:
            break;
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  let layer_pm25;
  let layer_pvBorder;
  if (map) {
    layer_pm25 = new sphere.Layer('0', {
      type: sphere.LayerType.WMS,
      url: 'https://gistdaportal.gistda.or.th/data/services/pm_check/pm25_hourly_raster/MapServer/WMSServer',
      // zoomRange: { min: 1, max: 12 },
      zIndex: 5,
      opacity: 0.8,
      id: 'layer_pm25',
    });

    layer_pvBorder = new sphere.Layer('0', {
      type: sphere.LayerType.WMS,
      url: 'https://gistdaportal.gistda.or.th/data2/services/L05_Province_GISTDA_50k_nonlabel/MapServer/WMSServer',
      // zoomRange: { min: 1, max: 12 },
      zIndex: 6,
      opacity: 1,
      id: 'layer_pvBorder',
    });
  }

  if (map) {
    if (pm25) {
      map.Layers.add(layer_pm25);
    } else {
      map.Layers.list().forEach((layer) => {
        if (layer.id === 'layer_pm25') {
          map.Layers.remove(layer_pm25);
          return;
        }
      });
    }
    if (boundary) {
      map.Layers.add(layer_pvBorder);
    } else {
      map.Layers.list().forEach((layer) => {
        if (layer.id === 'layer_pvBorder') {
          map.Layers.remove(layer_pvBorder);
          return;
        }
      });
    }
  }

  useEffect(() => {
    if (map && riceData) {
      let layer_rice = new sphere.Layer({
        sources: {
          rice: {
            type: 'geojson',
            data: riceData.result[0].feature_collection,
          },
        },
        layers: [
          {
            id: 'layer_rice',
            type: 'fill',
            source: 'rice',
            zIndex: 4,
            paint: {
              'fill-color': [
                'match',
                ['get', 'legend'],
                1,
                '#096108',
                2,
                '#4a8a10',
                3,
                '#8bb619',
                4,
                '#d4e725',
                5,
                '#fce626',
                6,
                '#fba81c',
                7,
                '#fa7115',
                8,
                '#fa290f',
                '#000',
              ],
              'fill-opacity': 0.4,
            },
          },
        ],
      });
      map.Layers.list().forEach((layer) => {
        if (layer.id === 'layer_rice') {
          map.Layers.remove(layer_rice);
          return;
        }
      });
      if (cropType === 'rice' && isCropShowed) map.Layers.add(layer_rice);
      console.log(map.Layers.list());
    }
  }, [cropType, isCropShowed, riceData]);

  useEffect(() => {
    if (map && maizeData) {
      let layer_maize = new sphere.Layer({
        sources: {
          maize: {
            type: 'geojson',
            data: maizeData.result[0].feature_collection,
          },
        },
        layers: [
          {
            id: 'layer_maize',
            type: 'fill',
            source: 'maize',
            zIndex: 4,
            paint: {
              'fill-color': [
                'match',
                ['get', 'legend'],
                0,
                '#096108',
                1,
                '#4a8a10',
                2,
                '#8bb619',
                3,
                '#d4e725',
                4,
                '#fce626',
                5,
                '#fba81c',
                6,
                '#fa7115',
                7,
                '#fa290f',
                '#000',
              ],
              'fill-opacity': 0.4,
            },
          },
        ],
      });
      map.Layers.list().forEach((layer) => {
        if (layer.id === 'layer_maize') {
          map.Layers.remove(layer_maize);
          return;
        }
      });
      if (cropType === 'maize' && isCropShowed) map.Layers.add(layer_maize);
      console.log(map.Layers.list());
    }
  }, [cropType, isCropShowed, maizeData]);

  useEffect(() => {
    if (map && sugarcaneData) {
      let layer_sugarcane = new sphere.Layer({
        sources: {
          sugarcane: {
            type: 'geojson',
            data: sugarcaneData.result[0].feature_collection,
          },
        },
        layers: [
          {
            id: 'layer_sugarcane',
            type: 'fill',
            source: 'sugarcane',
            zIndex: 4,
            paint: {
              'fill-color': [
                'match',
                ['get', 'legend'],
                1,
                '#096108',
                2,
                '#1d6909',
                3,
                '#33790c',
                4,
                '#44860f',
                5,
                '#539212',
                6,
                '#6ba315',
                7,
                '#7baf18',
                8,
                '#94bf1b',
                9,
                '#accc1e',
                10,
                '#bcdc22',
                11,
                '#dcec26',
                12,
                '#f4f829',
                13,
                '#fcfc2a',
                14,
                '#fce826',
                15,
                '#fbd824',
                16,
                '#fbc420',
                17,
                '#fbaf1d',
                18,
                '#fba01b',
                19,
                '#fa9019',
                20,
                '#fa7b16',
                21,
                '#fa6714',
                22,
                '#fa5812',
                23,
                '#fa4510',
                24,
                '#fa290f',
                '#000',
              ],
              'fill-opacity': 0.4,
            },
          },
        ],
      });
      map.Layers.list().forEach((layer) => {
        if (layer.id === 'layer_sugarcane') {
          map.Layers.remove(layer_sugarcane);
          return;
        }
      });
      if (cropType === 'sugarcane' && isCropShowed)
        map.Layers.add(layer_sugarcane);
      console.log(map.Layers.list());
    }
  }, [cropType, isCropShowed, sugarcaneData]);

  useEffect(() => {
    if (map && cassavaData) {
      let layer_cassava = new sphere.Layer({
        sources: {
          cassava: {
            type: 'geojson',
            data: cassavaData.result[0].feature_collection,
          },
        },
        layers: [
          {
            id: 'layer_cassava',
            type: 'fill',
            source: 'cassava',
            zIndex: 4,
            paint: {
              'fill-color': [
                'match',
                ['get', 'legend'],
                1,
                '#096108',
                2,
                '#1d6909',
                3,
                '#33790c',
                4,
                '#44860f',
                5,
                '#539212',
                6,
                '#6ba315',
                7,
                '#7baf18',
                8,
                '#94bf1b',
                9,
                '#accc1e',
                10,
                '#bcdc22',
                11,
                '#dcec26',
                12,
                '#f4f829',
                13,
                '#fcfc2a',
                14,
                '#fce826',
                15,
                '#fbd824',
                16,
                '#fbc420',
                17,
                '#fbaf1d',
                18,
                '#fba01b',
                19,
                '#fa9019',
                20,
                '#fa7b16',
                21,
                '#fa6714',
                22,
                '#fa5812',
                23,
                '#fa4510',
                24,
                '#fa290f',
                '#000',
              ],
              'fill-opacity': 0.4,
            },
          },
        ],
      });
      map.Layers.list().forEach((layer) => {
        if (layer.id === 'layer_cassava') {
          map.Layers.remove(layer_cassava);
          return;
        }
      });
      if (cropType === 'cassava' && isCropShowed) map.Layers.add(layer_cassava);
      console.log(map.Layers.list());
    }
  }, [cropType, isCropShowed, cassavaData]);

  useEffect(() => {
    month = date.format('MM');
    lastDate = date.format('DD') < 16 ? '15' : date.endOf('month').format('DD');
    tempDateCrop = date.format('YYYY-MM') + '-' + lastDate;
    if (tempDateCrop === lastDateCrop && cropType === lastCropType) return;
    // setLastDateCrop(tempDateCrop);
    // if (cropType === 'rice') {
    //   setLastCropType('rice');
    //   const riceQuery = `data=${cropType}_2023${month}${lastDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${tempDateCrop}' LIMIT 5000) AS subquery`;
    //   fetchData({
    //     query: riceQuery,
    //     setData: setRiceData,
    //     type: 1,
    //   });
    // } else if (cropType === 'maize') {
    //   setLastCropType('maize');
    //   const maizeQuery = `data=${cropType}_2023${month}${lastDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${tempDateCrop}' LIMIT 5000) AS subquery`;
    //   fetchData({
    //     query: maizeQuery,
    //     setData: setMaizeData,
    //     type: 1,
    //   });
    // } else if (cropType === 'sugarcane') {
    //   setLastCropType('sugarcane');
    //   const sugarcaneQuery = `data=${cropType}_2023${month}${lastDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${tempDateCrop}' LIMIT 5000) AS subquery`;
    //   fetchData({
    //     query: sugarcaneQuery,
    //     setData: setSugarcaneData,
    //     type: 1,
    //   });
    // } else {
    //   setLastCropType('cassava');
    //   const cassavaQuery = `data=${cropType}_2023${month}${lastDate}&select=json_build_object('type', 'FeatureCollection', 'features', json_agg(features)) AS feature_collection FROM (SELECT json_build_object('type', 'Feature', 'geometry', geom, 'properties', json_build_object('legend', legend)) AS features&where=data_date = '${tempDateCrop}' LIMIT 5000) AS subquery`;
    //   fetchData({
    //     query: cassavaQuery,
    //     setData: setCassavaData,
    //     type: 1,
    //   });
    // }
  }, [date, cropType]);

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

  if (hotspotData && isHotspotLoaded && map) {
    map.Overlays.clear();
    dots = [];
    let dot;
    hotspotData.result.forEach((item) => {
      if (item.lu_hp === 'A101' && isRiceLoaded) {
        dot = dotFactory(
          JSON.parse(item.latitude),
          JSON.parse(item.longitude),
          20,
          false,
          color.rice,
          0.5,
          item.lu_hp
        );
      } else if (item.lu_hp === 'A202' && isMaizeLoaded) {
        dot = dotFactory(
          JSON.parse(item.latitude),
          JSON.parse(item.longitude),
          20,
          false,
          color.maize,
          0.5,
          item.lu_hp
        );
      } else if (item.lu_hp === 'A203' && isSugarcaneLoaded) {
        dot = dotFactory(
          JSON.parse(item.latitude),
          JSON.parse(item.longitude),
          20,
          false,
          color.sugarcane,
          0.5,
          item.lu_hp
        );
      } else if (item.lu_hp === 'A999' && isOtherCropLoaded) {
        dot = dotFactory(
          JSON.parse(item.latitude),
          JSON.parse(item.longitude),
          20,
          false,
          color.otherCrop,
          0.5,
          item.lu_hp
        );
      } else if (item.lu_hp === 'F000' && isForestLoaded) {
        dot = dotFactory(
          JSON.parse(item.latitude),
          JSON.parse(item.longitude),
          20,
          false,
          color.forest,
          0.4,
          item.lu_hp
        );
      } else if (item.lu_hp === 'O000' && isOtherLoaded) {
        dot = dotFactory(
          JSON.parse(item.latitude),
          JSON.parse(item.longitude),
          20,
          false,
          color.other,
          0.5,
          item.lu_hp
        );
      }
      if (dot) map.Overlays.add(dot);
    });
  }

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
                minDate={dayjs('01-02-23', 'DD-MM-YY')}
                maxDate={dayjs('31-05-23', 'DD-MM-YY')}
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
      <div className='flex flex-col bg-white dark:bg-[#2c2c2c] rounded-lg px-4 py-2 drop-shadow-md'>
        <ThemeProvider theme={RadioButtonTheme}>
          <div>
            <FormLabel>
              <Checkbox
                onChange={() => setIsCropShowed(!isCropShowed)}
                checked={isCropShowed}
                disabled={!isCropLoaded}
              />
              {t('showCropType')}
            </FormLabel>
          </div>
          <FormControl>
            <RadioGroup
              row
              className='gap-4 pl-[11px]'
              onChange={(e) => setCropType(e.target.value)}
            >
              <FormControlLabel
                value='rice'
                label={t('crop.rice')}
                className='text-[#212121] dark:text-white'
                disabled={!isCropShowed || !isCropLoaded}
                control={<Radio />}
                checked={cropType === 'rice'}
              />
              <FormControlLabel
                value='maize'
                label={t('crop.maize')}
                className='text-[#212121] dark:text-white'
                disabled={!isCropShowed || !isCropLoaded}
                control={<Radio />}
                checked={cropType === 'maize'}
              />
              <FormControlLabel
                value='sugarcane'
                label={t('crop.sugarcane')}
                className='text-[#212121] dark:text-white'
                disabled={!isCropShowed || !isCropLoaded}
                control={<Radio />}
                checked={cropType === 'sugarcane'}
              />
              <FormControlLabel
                value='cassava'
                label={t('crop.cassava')}
                className='text-[#212121] dark:text-white'
                disabled={!isCropShowed || !isCropLoaded}
                control={<Radio />}
                checked={cropType === 'cassava'}
              />
            </RadioGroup>
          </FormControl>
        </ThemeProvider>
        {!isCropLoaded && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <ThemeProvider theme={circularProgressTheme}>
              <CircularProgress />
            </ThemeProvider>
          </div>
        )}
      </div>
      <div className=' bg-white dark:bg-[#2c2c2c] rounded-lg px-4 py-2 gap-y-2 drop-shadow-md'>
        <ThemeProvider theme={CheckBoxTheme}>
          <FormLabel>
            <Checkbox
              defaultChecked
              disabled={!isHotspotLoaded}
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
            {t('showHotspotInLandType')}
          </FormLabel>
          <div className='grid grid-cols-2 sm:grid-cols-3 '>
            <div className='flex flex-row items-center'>
              <div>
                <Checkbox
                  defaultChecked
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
                  defaultChecked
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
                  defaultChecked
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
                  defaultChecked
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
                  defaultChecked
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
                  defaultChecked
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
            <ThemeProvider theme={circularProgressTheme}>
              <CircularProgress />
            </ThemeProvider>
          </div>
        )}
      </div>
      {isHotspotLoaded ? (
        rows.length === 0 ? (
          <div className='flex flex-col items-center justify-center space-y-4 flex-1'>
            <p className='font-kanit text-2xl font-semibold text-gray-500 dark:text-gray-400'>
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
    </div>
  );
}
