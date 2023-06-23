import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import ToggleButton from '@mui/material/ToggleButton';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { Analysis, Overview } from '.';
import { Header, map, Map, sphere } from '../components';

const ToggleButtonGroupTheme = createTheme({
  palette: {
    mode: JSON.parse(localStorage.getItem('theme')),
    primary: {
      main: '#F390B0',
    },
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
    fontSize: 15,
  },
});

const LinearProgressTheme = createTheme({
  palette: {
    mode: JSON.parse(localStorage.getItem('theme')),
    primary: {
      main: '#F390B0',
    },
  },
});

const showElement = (show, hide) => {
  hide.classList.add('hidden');
  show.classList.remove('hidden');
};

const showOverview = () => {
  const overviewPage = document.getElementById('overviewPage');
  const analysisPage = document.getElementById('analysisPage');
  showElement(overviewPage, analysisPage);
};

const showAnalysis = () => {
  const overviewPage = document.getElementById('overviewPage');
  const analysisPage = document.getElementById('analysisPage');
  showElement(analysisPage, overviewPage);
};

export default function Visual() {
  const { t } = useTranslation();

  const [page, setPage] = React.useState('overview');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const handleAlignment = (event, newAlignment) => {
    if (!newAlignment) return;
    setPage(newAlignment);
    switch (newAlignment) {
      case 'overview':
        showOverview();
        break;
      case 'analysis':
        showAnalysis();
        break;
      default:
        showOverview();
        break;
    }
  };
  const intervalId = setInterval(() => {
    if (map && sphere.EventName.Ready === 'ready') setIsMapLoaded(true);
    if (isMapLoaded) {
      sphere.EventName.Ready = '';
      clearInterval(intervalId);
    }
  }, 10000);

  return (
    <div className='px-5 sm:px-10'>
      <Header text={page === 'overview' ? 'overviewTitle' : 'analysisTitle'} />
      <div className='flex flex-col h-auto drop-shadow-xl space-y-10'>
        <div className='flex flex-row justify-center'>
          <div className='flex flex-col order-2 sm:flex-row'>
            <ThemeProvider theme={ToggleButtonGroupTheme}>
              <ToggleButtonGroup
                color='primary'
                value={page}
                exclusive
                onChange={handleAlignment}
              >
                <ToggleButton value='overview' className='!capitalize'>
                  {t('map_type.overall')}
                </ToggleButton>
                <ToggleButton value='analysis' className='!capitalize'>
                  {t('map_type.analysis')}
                </ToggleButton>
              </ToggleButtonGroup>
            </ThemeProvider>
          </div>
        </div>
        <div className='flex mb-4 flex-col xl:flex-row bg-white rounded-lg dark:bg-[#444444]'>
          <div className='xl:w-3/5 xl:order-last relative'>
            {!isMapLoaded ? (
              <ThemeProvider theme={LinearProgressTheme}>
                <div className='w-full absolute z-10 pt-[0.4px]'>
                  <LinearProgress className='rounded-t-lg xl:rounded-none xl:rounded-tr-lg' />
                </div>
              </ThemeProvider>
            ) : null}
            <Map mapStyle='h-[500px] min-[425px]:h-[550px] md:h-[812px] z-0' />
          </div>
          <div id='overviewPage' className='xl:w-2/5 xl:order-first p-4'>
            <Overview />
          </div>
          <div id='analysisPage' className='xl:w-2/5 xl:order-first p-4 hidden'>
            <Analysis />
          </div>
        </div>
      </div>
    </div>
  );
}
