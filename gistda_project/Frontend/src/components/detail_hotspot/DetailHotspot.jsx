import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { useTranslation } from 'react-i18next';

import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { Dropdown, Tablesort } from '..';

const baseURL = 'http://localhost:3001/';

const months = [
  'months.jan',
  'months.feb',
  'months.mar',
  'months.apr',
  'months.may',
  'months.jun',
  'months.jul',
  'months.aug',
  'months.sep',
  'months.oct',
  'months.nov',
  'months.dec',
];

const buttonTheme = createTheme({
  palette: {
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
    primary: {
      main: '#F390B0',
    },
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
  },
});

export default function DetailHotspot() {
  const { t } = useTranslation();
  const [boundary, setBoundary] = useState(false);

  let [data, setPosts] = useState({ result: [] });

  const fetchPosts = async ({ query }) => {
    try {
      const response = await axios.get(`${baseURL}?${query}`);
      setPosts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  if (!data) {
    return <div>No data</div>;
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
          item.changwat,
          item.amphoe,
          item.tambol,
          item.th_date
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
          <Dropdown label={t('month')} items={months} />
        </ThemeProvider>
      </div>
      <div className=''>
        <Tablesort
          columns={columns}
          rows={rows}
          height='620px'
          colSortDisabled={['district']}
          colSortDefault='spot'
        />
      </div>
      <div>
        <input
          type='text'
          id='user_query'
          className='w-64 bg-black text-white'
          value="data=hotspot_202303&select=*&where=to_date(acq_date,%20'DD-MM-YY')%20BETWEEN%20to_date('2023-03-01',%20'YYYY-MM-DD')%20AND%20to_date('2023-03-31',%20'YYYY-MM-DD')&order_by=acq_date&order=desc"
        />
        <button
          onClick={() =>
            fetchPosts({ query: document.getElementById('user_query').value })
          }
          className='bg-white'
        >
          GET
        </button>
      </div>
    </div>
  );
}
