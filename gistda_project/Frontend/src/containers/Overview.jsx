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
let currentDate;

export const getMonth = () => month;
export const getLastCropDate = () => lastDate;
export const getLastDateCrop = () => tempDateCrop;
export const getDots = () => dots;
export const getDate = () => currentDate;

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
  const [isCropShowed, setIsCropShowed] = useState(false);
  const [cropType, setCropType] = useState('rice');
  const [isHotspotShowed, setIsHotspotShowed] = useState(false);
  const [lastDateCrop, setLastDateCrop] = useState('2023-03-06');
  const [lastCropType, setLastCropType] = useState('rice');
  const [isRiceLoaded, setIsRiceLoaded] = useState(false);
  const [isMaizeLoaded, setIsMaizeLoaded] = useState(false);
  const [isSugarcaneLoaded, setIsSugarcaneLoaded] = useState(false);
  const [isOtherCropLoaded, setIsOtherCropLoaded] = useState(false);
  const [isForestLoaded, setIsForestLoaded] = useState(false);
  const [isOtherLoaded, setIsOtherLoaded] = useState(false);

  currentDate = date;

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
    if (tempDateCrop === lastDateCrop && cropType === lastCropType) return;
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
            <span className='loading loading-infinity w-12 text-[#f390b0]'></span>
          </div>
        )}
      </div>
      <div className=' bg-white dark:bg-[#2c2c2c] rounded-lg px-4 py-2 gap-y-2 drop-shadow-md'>
        <ThemeProvider theme={CheckBoxTheme}>
          <FormLabel>
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
            {t('showHotspotInLandType')}
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
