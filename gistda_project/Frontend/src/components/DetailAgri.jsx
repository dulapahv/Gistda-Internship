import React, { useEffect, useState } from 'react';

import axios from 'axios';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { map } from '.';

import { Tablesort } from '.';
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

const date = [
  '01/02/2023 - 15/02/2023',
  '16/02/2023 - 28/02/2023',
  '01/03/2023 - 15/03/2023',
  '16/03/2023 - 31/03/2023',
  '01/04/2023 - 15/04/2023',
  '16/04/2023 - 30/04/2023',
  '01/05/2023 - 15/05/2023',
  '16/05/2023 - 31/05/2023',
];

const agriType = ['Rice', 'Maize', 'Sugarcane', 'Cassava'];

export default function DetailAgri() {
  const { t, i18n } = useTranslation();
  const [boundary, setBoundary] = useState(false);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [dateRange, setDateRange] = useState(date[1]);
  const [crop, setCrop] = useState(agriType[0]);

  let [data, setData] = useState();

  if (map) map.Overlays.clear();

  const fetchData = async ({ query }) => {
    setIsTableLoaded(false);
    axios
      .get(`${baseURL}?${query}`)
      .then(function (response) {
        setData(response.data);
        setIsTableLoaded(true);
      })
      .catch(function (error) {
        console.log(error);
        setData([]);
      });
  };

  useEffect(() => {
    const dateFrom = dayjs(dateRange.split(' - ')[0], 'DD/MM/YYYY').format(
      'DD-MM-YYYY'
    );
    const dateTo = dayjs(dateRange.split(' - ')[1], 'DD/MM/YYYY').format(
      'YYYY-MM-DD'
    );
    const month = dayjs(dateFrom, 'DD-MM-YYYY').format('MM');
    const maxDate = dayjs(dateRange.split(' - ')[1], 'DD/MM/YYYY').format('DD');
    fetchData({
      query: `data=${i18n.t(('crop.' + crop).toLowerCase(), {
        lng: 'en',
      })}_2023${month}${maxDate}&select=p_name,rai,yield&where=data_date='${dateTo}'`,
    });
  }, [dateRange, crop]);

  if (data && data.length === 0) {
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
            <Box className='min-w-120'>
              <FormControl fullWidth>
                <InputLabel>{t('dateRange')}</InputLabel>
                <Select
                  value={dateRange}
                  label={t('dateRange')}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  {date.map((item) => (
                    <MenuItem value={item} key={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </ThemeProvider>
          <ThemeProvider theme={dropdownTheme}>
            <Box className='min-w-120'>
              <FormControl fullWidth>
                <InputLabel>{t('cropType')}</InputLabel>
                <Select
                  value={t(crop)}
                  label={t('cropType')}
                  onChange={(e) => setCrop(e.target.value)}
                >
                  {agriType.map((item) => (
                    <MenuItem value={t(item)} key={t(item)}>
                      {t(item)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </ThemeProvider>
        </div>
        <div className='flex flex-col items-center justify-center space-y-4'>
          <p className='font-kanit text-2xl font-semibold text-gray-500 dark:text-gray-400'>
            {t('noData')}
          </p>
        </div>
      </div>
    );
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
            <Box className='min-w-120'>
              <FormControl fullWidth>
                <InputLabel>{t('dateRange')}</InputLabel>
                <Select
                  value={dateRange}
                  label={t('dateRange')}
                  onChange={(e) => setDateRange(e.target.value.toLowerCase())}
                >
                  {date.map((item) => (
                    <MenuItem
                      value={item.toLowerCase()}
                      key={item.toLowerCase()}
                    >
                      {item.toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </ThemeProvider>
          <ThemeProvider theme={dropdownTheme}>
            <Box className='min-w-120'>
              <FormControl fullWidth>
                <InputLabel>{t('cropType')}</InputLabel>
                <Select
                  value={t(crop)}
                  label={t('cropType')}
                  onChange={(e) => setCrop(e.target.value)}
                >
                  {agriType.map((item) => (
                    <MenuItem value={t(item)} key={t(item)}>
                      {t(item)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
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
      width: 100,
      label: t('district'),
      dataKey: 'district',
      renderButton: true,
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

  function createData(id, province, rai, yields) {
    return {
      id,
      province,
      rai,
      yields,
    };
  }

  const rowsMap = new Map();

  data.result.forEach((item) => {
    const id = item.p_name;
    const province = t('pv.' + item.p_name);
    const rai = parseFloat(item.rai);
    const yields = parseFloat(item.yield);

    if (rowsMap.has(id)) {
      const row = rowsMap.get(id);
      row.rai += rai;
      row.yields += yields;
    } else {
      const row = createData(id, province, rai, yields);
      rowsMap.set(id, row);
    }
  });

  const rows = Array.from(rowsMap.values());

  rows.forEach((row) => {
    row.rai = row.rai.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    row.yields = row.yields.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  });

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
          <Box className='min-w-120'>
            <FormControl fullWidth>
              <InputLabel>{t('dateRange')}</InputLabel>
              <Select
                value={dateRange}
                label={t('dateRange')}
                onChange={(e) => setDateRange(e.target.value)}
              >
                {date.map((item) => (
                  <MenuItem value={item} key={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </ThemeProvider>
        <ThemeProvider theme={dropdownTheme}>
          <Box className='min-w-120'>
            <FormControl fullWidth>
              <InputLabel>{t('cropType')}</InputLabel>
              <Select
                value={t(crop)}
                label={t('cropType')}
                onChange={(e) => setCrop(e.target.value)}
              >
                {agriType.map((item) => (
                  <MenuItem value={t(item)} key={t(item)}>
                    {t(item)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </ThemeProvider>
      </div>
      <div className='drop-shadow-md'>
        <Tablesort
          columns={columns}
          rows={rows}
          height='620px'
          colSortDisabled={['district']}
          colSortDefault='rai'
        />
      </div>
    </div>
  );
}
