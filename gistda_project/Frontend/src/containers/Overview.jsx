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
import BorderAllIcon from '@mui/icons-material/BorderAll';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import BorderClearIcon from '@mui/icons-material/BorderClear';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { map, sphere } from '../components';
import { TableOverview } from '../components';

const baseURL = 'http://localhost:3001/';

const color = {
  rice: '#fb6584',
  maize: '#48a1e9',
  sugarcane: '#fbce5c',
  otherCrop: '#56c0c0',
  forest: '#9c63fd',
  other: '#fba046',
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
      main: '#78bcfe',
      dark: '#8bc2ff',
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
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [date, setDate] = React.useState(dayjs('2023-03-06'));
  const [crop, setCrop] = useState('rice');
  const [hotspotData, setHotspotData] = useState();
  const [cropData, setCropData] = useState();
  const [isRiceLoaded, setIsRiceLoaded] = useState(true);
  const [isMaizeLoaded, setIsMaizeLoaded] = useState(true);
  const [isSugarcaneLoaded, setIsSugarcaneLoaded] = useState(true);
  const [isOtherCropLoaded, setIsOtherCropLoaded] = useState(true);
  const [isForestLoaded, setIsForestLoaded] = useState(true);
  const [isOtherLoaded, setIsOtherLoaded] = useState(true);

  const fetchData = async ({ query, setData }) => {
    setIsTableLoaded(false);
    axios
      .get(`${baseURL}?${query}`)
      .then(function (response) {
        setData(response.data);
        setIsTableLoaded(true);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    const month = date.format('MM');
    const lastDate =
      date.format('DD') < 16 ? '15' : date.endOf('month').format('DD');
    const dateCrop = date.format('YYYY-MM') + '-' + lastDate;

    const hotspotQuery = `data=hotspot_2023${month}&select=latitude,longitude,lu_hp,pv_tn,ap_tn,pv_en,ap_en,pv_idn,th_time&where=acq_date='${date.format(
      'DD-MM-YY'
    )}'`;
    // const cropQuery = `data=${crop}_2023${month}${lastDate}&select=p_name,rai,yield&where=data_date='${dateCrop}'`;
    const cropQuery = `data=${crop}_2023${month}${lastDate}&select=st_asgeojson(geom)&where=data_date='${dateCrop}'limit 1`;

    fetchData({
      query: hotspotQuery,
      setData: setHotspotData,
    });

    fetchData({
      query: cropQuery,
      setData: setCropData,
    });
  }, [date]);

  if (hotspotData && isTableLoaded && map) {
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

  if (!hotspotData || !isTableLoaded) {
    return (
      <div className='flex flex-col space-y-4'>
        <div className='grid gap-4 sm:grid-cols-1 md:grid-cols-2'>
          <ThemeProvider theme={buttonTheme}>
            <Button
              variant='contained'
              className='h-full w-full min-h-50 !capitalize'
              onClick={() => setBoundary(!boundary)}
              color={boundary ? 'secondary' : 'primary'}
            >
              {boundary ? t('hideProvinceBoundary') : t('showProvinceBoundary')}
            </Button>
          </ThemeProvider>
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
        <div>
          <Stack spacing={-2}>
            <ThemeProvider theme={skeletonTheme}>
              {Array.from({ length: 9 }).map((_, index) => (
                <Skeleton
                  key={index}
                  animation='wave'
                  height={80}
                  width='100%'
                />
              ))}
            </ThemeProvider>
          </Stack>
        </div>
      </div>
    );
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

  const rows = Array.from(rowsMap.values());

  return (
    <div className='flex flex-col space-y-4 h-full'>
      <div className='grid gap-4 sm:grid-cols-1 md:grid-cols-2'>
        <ThemeProvider theme={buttonTheme}>
          <Button
            variant='contained'
            className='h-full w-full min-h-50 !capitalize'
            startIcon={boundary ? <BorderClearIcon /> : <BorderAllIcon />}
            onClick={() => setBoundary(!boundary)}
            color={boundary ? 'secondary' : 'primary'}
          >
            {boundary ? t('hideProvinceBoundary') : t('showProvinceBoundary')}
          </Button>
        </ThemeProvider>
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
      <div className='flex flex-col bg-white dark:bg-[#2c2c2c] rounded-lg px-4 py-2 drop-shadow-md'>
        <ThemeProvider theme={RadioButtonTheme}>
          <FormLabel>{t('showCropType')}</FormLabel>
          <FormControl>
            <RadioGroup defaultValue='rice' row className='gap-4'>
              <FormControlLabel
                value='rice'
                control={<Radio onChange={(e) => setCrop(e.target.crop)} />}
                label={t('crop.rice')}
                className='text-[#212121] dark:text-white'
              />
              <FormControlLabel
                value='maize'
                control={<Radio onChange={(e) => setCrop(e.target.crop)} />}
                label={t('crop.maize')}
                className='text-[#212121] dark:text-white'
              />
              <FormControlLabel
                value='sugarcane'
                control={<Radio onChange={(e) => setCrop(e.target.crop)} />}
                label={t('crop.sugarcane')}
                className='text-[#212121] dark:text-white'
              />
              <FormControlLabel
                value='cassava'
                control={<Radio onChange={(e) => setCrop(e.target.crop)} />}
                label={t('crop.cassava')}
                className='text-[#212121] dark:text-white'
              />
            </RadioGroup>
          </FormControl>
        </ThemeProvider>
      </div>
      <div className=' bg-white dark:bg-[#2c2c2c] rounded-lg px-4 py-2 gap-y-2 drop-shadow-md'>
        <ThemeProvider theme={CheckBoxTheme}>
          <FormLabel>{t('showHotspotInLandType')}</FormLabel>
          <div className='grid grid-cols-2 sm:grid-cols-3 '>
            <div className='flex flex-row items-center'>
              <div>
                <Checkbox
                  defaultChecked
                  onChange={() => setIsRiceLoaded(!isRiceLoaded)}
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
                  onChange={() => setIsMaizeLoaded(!isMaizeLoaded)}
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
                  onChange={() => setIsSugarcaneLoaded(!isSugarcaneLoaded)}
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
                  onChange={() => setIsOtherCropLoaded(!isOtherCropLoaded)}
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
                  onChange={() => setIsForestLoaded(!isForestLoaded)}
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
                  onChange={() => setIsOtherLoaded(!isOtherLoaded)}
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
      </div>
      {rows.length === 0 ? (
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
      )}
    </div>
  );
}
