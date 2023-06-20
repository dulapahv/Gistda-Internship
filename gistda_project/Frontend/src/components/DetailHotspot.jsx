import React, { useEffect, useState } from 'react';

import axios from 'axios';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { Tablesort } from '.';
import { map, sphere } from '.';

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

const dropdownTheme = createTheme({
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

export default function DetailHotspot() {
  const { t, i18n } = useTranslation();
  const [boundary, setBoundary] = useState(false);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const months = ['months.feb', 'months.mar', 'months.apr', 'months.may'];
  const [month, setMonth] = useState(t(months[0]));

  let [data, setData] = useState();

  const fetchData = async ({ query }) => {
    try {
      setIsTableLoaded(false);
      const response = await axios.get(`${baseURL}?${query}`);
      setData(response.data);
      setIsTableLoaded(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const monthToNum = {
      [t(months[0])]: '02',
      [t(months[1])]: '03',
      [t(months[2])]: '04',
      [t(months[3])]: '05',
    };

    const monthNum = monthToNum[t(month)];
    const monthStartDate = moment(`2023-${monthNum}-01`).format('YYYY-MM-DD');
    const monthEndDate = moment(`2023-${monthNum}`)
      .endOf('month')
      .format('YYYY-MM-DD');

    fetchData({
      query: `data=hotspot_2023${monthNum}&select=*&where=to_date(acq_date,%20'DD-MM-YY')%20BETWEEN%20to_date('${monthStartDate}',%20'YYYY-MM-DD')%20AND%20to_date('${monthEndDate}',%20'YYYY-MM-DD')&order_by=acq_date&order=desc`,
    });
  }, [t(month)]);

  const handleChange = (event) => {
    setMonth(event.target.value);
  };

  const dotFactory = (lat, lon, lineWidth = 10, draggable = false) => {
    const dot = new sphere.Dot(
      {
        lon: lon,
        lat: lat,
      },
      {
        lineWidth: lineWidth,
        draggable: draggable,
        lineColor: '#FB568A',
      }
    );
    return dot;
  };

  if (data && isTableLoaded && map) {
    map.Overlays.clear();
    data.result.forEach((item) => {
      const dot = dotFactory(
        JSON.parse(item.latitude),
        JSON.parse(item.longitude)
      );
      map.Overlays.add(dot);
    });
  }

  if (!data || !isTableLoaded) {
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
          <ThemeProvider theme={dropdownTheme}>
            <ThemeProvider theme={dropdownTheme}>
              <Box className='min-w-120'>
                <FormControl fullWidth>
                  <InputLabel>{t('month')}</InputLabel>
                  <Select
                    value={month}
                    label={t('month')}
                    onChange={handleChange}
                  >
                    {months.map((item) => (
                      <MenuItem value={item} key={t(item)}>
                        {t(item)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </ThemeProvider>
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
      width: 115,
      label: t('province'),
      dataKey: 'province',
      align: 'left',
    },
    {
      width: 150,
      label: t('spot'),
      dataKey: 'spot',
    },
    {
      width: 100,
      label: t('district'),
      dataKey: 'district',
      renderButton: true,
    },
    {
      width: 145,
      label: t('date'),
      dataKey: 'date',
    },
  ];

  function createData(id, province, district, spot, date) {
    return {
      id,
      province,
      district,
      spot: 0,
      date,
    };
  }

  const rowsMap = new Map();

  data.result.forEach((item) => {
    const key = item.changwat;
    if (rowsMap.has(key)) {
      rowsMap.get(key).spot++;
    } else {
      rowsMap.set(
        key,
        createData(
          rowsMap.size,
          `${i18n.language === 'th' ? item.pv_tn : item.pv_en}`,
          `${i18n.language === 'th' ? item.ap_tn : item.ap_en}`,
          `${i18n.language === 'th' ? item.tb_tn : item.tb_en}`,
          `${item.acq_date.slice(0, 2)}/${item.acq_date.slice(
            3,
            5
          )}/20${item.acq_date.slice(6, 8)}`
        )
      );
    }
  });

  const rows = Array.from(rowsMap.values());

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
        <ThemeProvider theme={dropdownTheme}>
          <ThemeProvider theme={dropdownTheme}>
            <ThemeProvider theme={dropdownTheme}>
              <Box className='min-w-120'>
                <FormControl fullWidth>
                  <InputLabel>{t('month')}</InputLabel>
                  <Select
                    value={month}
                    label={t('month')}
                    onChange={handleChange}
                  >
                    {months.map((item) => (
                      <MenuItem value={item} key={t(item)}>
                        {t(item)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </ThemeProvider>
          </ThemeProvider>
        </ThemeProvider>
      </div>
      <div>
        <Tablesort
          columns={columns}
          rows={rows}
          height='620px'
          colSortDisabled={['district']}
          colSortDefault='spot'
        />
      </div>
    </div>
  );
}
