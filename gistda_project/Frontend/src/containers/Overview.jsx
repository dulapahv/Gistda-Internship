import React, { useEffect, useState } from 'react';

import axios from 'axios';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import { map, sphere } from '../components';
import { TableOverview } from '../components';

const baseURL = 'http://localhost:3001/';

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

export default function DetailHotspot() {
  const { t, i18n } = useTranslation();
  const [boundary, setBoundary] = useState(false);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [date, setDate] = React.useState(dayjs('2023-03-06'));
  const [crop, setCrop] = useState('rice');
  const [hotspotData, setHotspotData] = useState();
  const [cropData, setCropData] = useState();

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

    const hotspotQuery = `data=hotspot_2023${month}&select=*&where=acq_date='${date.format(
      'DD-MM-YY'
    )}'`;
    const cropQuery = `data=${crop}_2023${month}${lastDate}&select=p_name,rai,yield&where=data_date='${dateCrop}'`;

    fetchData({
      query: hotspotQuery,
      setData: setHotspotData,
    });

    fetchData({
      query: cropQuery,
      setData: setCropData,
    });
  }, [date]);

  useEffect(() => {
    if (hotspotData && cropData) {
      createTableData();
    }
  }, [hotspotData, cropData]);

  const dotFactory = (
    lat,
    lon,
    lineWidth = 20,
    draggable = false,
    lineColor = '#FB568A',
    alpha = 0.4
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
      }
    );
    return dot;
  };

  if (hotspotData && isTableLoaded && map) {
    map.Overlays.clear();
    hotspotData.result.forEach((item) => {
      const dot = dotFactory(
        JSON.parse(item.latitude),
        JSON.parse(item.longitude),
        20,
        false,
        getColorByCode(item.lu_hp),
        0.4
      );
      map.Overlays.add(dot);
    });
  }

  function getColorByCode(lu_hp) {
    switch (lu_hp) {
      case 'A101':
        return '#FB568A';
      case 'A202':
        return '#FFC700';
      case 'A203':
        return '#00B4FF';
      case 'A999':
        return '#00FF00';
      case 'F000':
        return '#FF0000';
      case 'O000':
        return '#FF00FF';
      default:
        return '#000000';
    }
  }

  const CultivationType = ({ color, label }) => {
    return (
      <div className='flex flex-row items-center space-x-2'>
        <div>
          <div className={`bg-[${color}] rounded-full w-5 h-5`}></div>
        </div>
        <div className='font-kanit text-[#212121] dark:text-white'>{`${t(
          'landUse.' + label
        )}`}</div>
      </div>
    );
  };

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
        <div className='grid grid-cols-2 sm:grid-cols-3 bg-white dark:bg-[#2c2c2c] rounded-lg px-4 py-2 gap-y-2 drop-shadow-md'>
          <CultivationType color='#FB568A' label='นาข้าว' />
          <CultivationType color='#FFC700' label='ข้าวโพดและไร่หมุนเวียน' />
          <CultivationType color='#00B4FF' label='อ้อย' />
          <CultivationType color='#00FF00' label='เกษตรอื่น ๆ' />
          <CultivationType color='#FF0000' label='พื้นที่ป่า' />
          <CultivationType color='#FF00FF' label='อื่น ๆ' />
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
      width: 100,
      label: t('district'),
      dataKey: 'district',
      renderButton: true,
    },
    {
      width: 130,
      label: t('spot'),
      dataKey: 'spot',
    },
    {
      width: 150,
      label: t('time'),
      dataKey: 'time',
    },
    {
      width: 120,
      label: t('rai'),
      dataKey: 'rai',
    },
    {
      width: 120,
      label: t('yield'),
      dataKey: 'yields',
    },
  ];

  function createData(id, province, district, spot = 1, rai, yields, time) {
    return {
      id,
      province,
      district,
      spot,
      rai: parseFloat(rai),
      yields: parseFloat(yields),
      time,
    };
  }

  const rowsMap = new Map();

  const formatNumber = (number) => {
    const formattedNumber = parseFloat(number).toFixed(3);
    return parseFloat(formattedNumber).toLocaleString('en-US');
  };

  const createTableData = () => {
    const maxLength = Math.max(
      hotspotData.result.length,
      cropData.result.length
    );

    for (let i = 0; i < maxLength; i++) {
      const hotspotItem = hotspotData.result[i];
      const cropItem = cropData.result[i];

      const id = hotspotItem ? hotspotItem.changwat : cropItem.p_name;
      const hour = hotspotItem
        ? hotspotItem.th_time.toString().slice(0, 2).padStart(2, '0')
        : '';
      const minute = hotspotItem
        ? hotspotItem.th_time.toString().slice(2, 4).padStart(2, '0')
        : '';
      const formattedTime = hotspotItem ? `${hour}:${minute}` : '';

      if (hotspotItem && cropItem) {
        if (rowsMap.has(id)) {
          rowsMap.get(id).spot++;
          rowsMap.get(id).rai += parseFloat(cropItem.rai);
          rowsMap.get(id).yields += parseFloat(cropItem.yield);
        } else {
          rowsMap.set(
            id,
            createData(
              hotspotItem.pv_idn,
              i18n.language === 'th' ? hotspotItem.pv_tn : hotspotItem.pv_en,
              i18n.language === 'th' ? hotspotItem.ap_tn : hotspotItem.ap_en,
              1,
              cropItem.rai,
              cropItem.yield,
              formattedTime
            )
          );
        }
      } else if (hotspotItem) {
        // Handle case when cropData is shorter
        if (rowsMap.has(id)) {
          rowsMap.get(id).spot++;
        } else {
          rowsMap.set(
            id,
            createData(
              hotspotItem.pv_idn,
              i18n.language === 'th' ? hotspotItem.pv_tn : hotspotItem.pv_en,
              i18n.language === 'th' ? hotspotItem.ap_tn : hotspotItem.ap_en,
              0,
              0,
              0,
              formattedTime
            )
          );
        }
      } else if (cropItem) {
        // Handle case when hotspotData is shorter
        if (rowsMap.has(id)) {
          rowsMap.get(id).rai += parseFloat(cropItem.rai);
          rowsMap.get(id).yields += parseFloat(cropItem.yield);
        } else {
          rowsMap.set(
            id,
            createData(
              cropItem.p_code,
              cropItem.p_name,
              cropItem.a_name,
              0,
              cropItem.rai,
              cropItem.yield,
              '-'
            )
          );
        }
      }
    }
  };

  if (hotspotData && cropData) createTableData();

  const rows = Array.from(rowsMap.values()).map((row) => ({
    ...row,
    rai: formatNumber(row.rai),
    yields: formatNumber(row.yields),
  }));

  return (
    <div className='flex flex-col space-y-4 h-full'>
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
                <Checkbox defaultChecked />
              </div>
              <div className='flex flex-row items-center space-x-2'>
                <div>
                  <div className={`bg-[#FB568A] rounded-full w-5 h-5`}></div>
                </div>
                <div className='font-kanit text-[#212121] dark:text-white'>{`${t(
                  'landUse.นาข้าว'
                )}`}</div>
              </div>
            </div>
            <div className='flex flex-row items-center'>
              <div>
                <Checkbox defaultChecked />
              </div>
              <div className='flex flex-row items-center space-x-2'>
                <div>
                  <div className={`bg-[#FFC700] rounded-full w-5 h-5`}></div>
                </div>
                <div className='font-kanit text-[#212121] dark:text-white'>{`${t(
                  'landUse.ข้าวโพดและไร่หมุนเวียน'
                )}`}</div>
              </div>
            </div>
            <div className='flex flex-row items-center'>
              <div>
                <Checkbox defaultChecked />
              </div>
              <div className='flex flex-row items-center space-x-2'>
                <div>
                  <div className={`bg-[#00B4FF] rounded-full w-5 h-5`}></div>
                </div>
                <div className='font-kanit text-[#212121] dark:text-white'>{`${t(
                  'landUse.อ้อย'
                )}`}</div>
              </div>
            </div>
            <div className='flex flex-row items-center'>
              <div>
                <Checkbox defaultChecked />
              </div>
              <div className='flex flex-row items-center space-x-2'>
                <div>
                  <div className={`bg-[#00FF00] rounded-full w-5 h-5`}></div>
                </div>
                <div className='font-kanit text-[#212121] dark:text-white'>{`${t(
                  'landUse.เกษตรอื่น ๆ'
                )}`}</div>
              </div>
            </div>
            <div className='flex flex-row items-center'>
              <div>
                <Checkbox defaultChecked />
              </div>
              <div className='flex flex-row items-center space-x-2'>
                <div>
                  <div className={`bg-[#FF0000] rounded-full w-5 h-5`}></div>
                </div>
                <div className='font-kanit text-[#212121] dark:text-white'>{`${t(
                  'landUse.พื้นที่ป่า'
                )}`}</div>
              </div>
            </div>
            <div className='flex flex-row items-center'>
              <div>
                <Checkbox defaultChecked />
              </div>
              <div className='flex flex-row items-center space-x-2'>
                <div>
                  <div className={`bg-[#FF00FF] rounded-full w-5 h-5`}></div>
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
            colSortDefault='spot'
          />
        </div>
      )}
    </div>
  );
}
