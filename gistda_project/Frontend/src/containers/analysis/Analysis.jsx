import React from 'react';

import { useTranslation } from 'react-i18next';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Barchart, Checkbox, Dropdown } from '../../components';

const dateRange = [
  '2023/03/01 - 2023/03/31',
  '2023/04/01 - 2023/04/31',
  '2023/05/01 - 2023/05/31',
];

const agriType = ['crop.rice', 'crop.maize', 'crop.sugarcane', 'crop.cassava'];

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

const checkboxTheme = createTheme({
  palette: {
    primary: {
      main: '#F390B0',
    },
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
  },
});

export default function Analysis() {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col h-auto drop-shadow-xl space-y-10'>
      <div className='mb-4 md:flex-row bg-white rounded-lg p-4 space-y-4 dark:bg-[#444444]'>
        <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'>
          <ThemeProvider theme={dropdownTheme}>
            <Dropdown label={t('dateRange')} items={dateRange} />
            <Dropdown label={t('province')} items={dateRange} />
            <Dropdown label={t('district')} items={dateRange} />
            <Dropdown label={t('subDistrict')} items={dateRange} />
          </ThemeProvider>
        </div>
        <div className='flex flex-col md:flex-row space-x-0 md:space-x-8'>
          <div className='flex flex-col justify-center'>
            <p className='font-kanit dark:text-white'>{t('displayCropType')}</p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4'>
            <ThemeProvider theme={checkboxTheme}>
              <Checkbox label={agriType[0]} />
              <Checkbox label={agriType[1]} />
              <Checkbox label={agriType[2]} />
              <Checkbox label={agriType[3]} />
            </ThemeProvider>
          </div>
        </div>
        <div className='flex justify-center'>
          <div className='w-full md:w-9/12 max-w-screen-2xl'>
            <Barchart />
          </div>
        </div>
      </div>
    </div>
  );
}
