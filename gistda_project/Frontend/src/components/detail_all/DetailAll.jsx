import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { Dropdown } from '..';

const dateRange = [
  '2023/03/01 - 2023/03/31',
  '2023/04/01 - 2023/04/31',
  '2023/05/01 - 2023/05/31',
];

const agriType = ['crop.rice', 'crop.maize', 'crop.sugarcane', 'crop.cassava'];

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

export default function DetailAll() {
  const { t } = useTranslation();
  const [boundary, setBoundary] = useState(false);

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
          <Dropdown label={t('dateRange')} items={dateRange} />
          <Dropdown label={t('cropType')} items={agriType} />
        </ThemeProvider>
      </div>
      {/* <div className="">
                <Tablesort />
            </div> */}
    </div>
  );
}
