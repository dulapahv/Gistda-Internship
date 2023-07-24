import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Backdrop from '@mui/material/Backdrop';
import PublicIcon from '@mui/icons-material/Public';
import ToggleButton from '@mui/material/ToggleButton';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { Analysis, Overview } from '.';
import { Header, map, Map, sphere } from '../components';

const ToggleButtonGroupTheme = createTheme({
  palette: {
    mode: localStorage.getItem('theme'),
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
    mode: localStorage.getItem('theme'),
    primary: {
      main: '#F390B0',
    },
  },
});

const skeletonTheme = createTheme({
  palette: {
    mode: localStorage.getItem('theme'),
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
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
  document.getElementById('analysisBackBtn')?.click();
};

const showAnalysis = () => {
  const overviewPage = document.getElementById('overviewPage');
  const analysisPage = document.getElementById('analysisPage');
  showElement(analysisPage, overviewPage);
};

export default function Visual() {
  const { t } = useTranslation();
  const [page, setPage] = React.useState('overviewPage');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const handleAlignment = (event, newAlignment) => {
    if (!newAlignment) return;
    if (document.getElementById('hotspot-checkbox')?.checked)
      document.getElementById('hotspot-checkbox')?.click();
    setPage(newAlignment);
    switch (newAlignment) {
      case 'overviewPage':
        showOverview();
        break;
      case 'analysisPage':
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
  }, 3000);

  if (isMapLoaded) {
    if (!window.sphereDrawLoaded) {
      
    }
  }

  return (
    <>
      {!isMapLoaded && (
        <div>
          <Backdrop
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
            open={true}
            className='flex flex-col place-content-center'
          >
            <span className='loading loading-infinity w-16 text-[#f390b0]'></span>
            <h1 className='font-kanit text-[#f390b0] text-2xl'>
              {t('loading')}
            </h1>
          </Backdrop>
        </div>
      )}
      <div
        className='px-5 h-fit xl:h-screen xl:mb-44 min-h-[820px]'
        id='visualHeader'
      >
        <Header
          text={page === 'overviewPage' ? 'overviewTitle' : 'analysisTitle'}
        />
        <div className='flex flex-col drop-shadow-xl space-y-10 h-[calc(100%-32px)]'>
          <div className='flex flex-row justify-center'>
            <div className='flex flex-col xl:flex-row'>
              <ThemeProvider theme={ToggleButtonGroupTheme}>
                <ToggleButtonGroup
                  color='primary'
                  value={page}
                  exclusive
                  onChange={handleAlignment}
                >
                  <ToggleButton
                    id='page1'
                    value='overviewPage'
                    className='!capitalize'
                  >
                    <PublicIcon className='mr-2' />
                    {t('map_type.overall')}
                  </ToggleButton>
                  <ToggleButton
                    id='page2'
                    value='analysisPage'
                    className='!capitalize'
                  >
                    <TravelExploreIcon className='mr-2' />
                    {t('map_type.analysis')}
                  </ToggleButton>
                </ToggleButtonGroup>
              </ThemeProvider>
            </div>
          </div>
          <div
            className='flex flex-col xl:flex-row mb-4 bg-white rounded-lg dark:bg-[#444444] h-full'
            id='visual1'
          >
            <div
              className='xl:w-3/5 relative flex-grow order-1 xl:order-2 aspect-square'
              id='visual2'
            >
              {!isMapLoaded && (
                <ThemeProvider theme={LinearProgressTheme}>
                  <div className='w-full absolute z-10 pt-[0.4px]'>
                    <LinearProgress
                      className='rounded-t-lg xl:rounded-none xl:rounded-tr-lg'
                      id='visual3'
                    />
                  </div>
                </ThemeProvider>
              )}
              <div className='h-full'>
                <Map mapStyle='h-full w-full' />
              </div>
            </div>
            {isMapLoaded ? (
              <>
                <div
                  id='overviewPage'
                  className='xl:w-2/5 p-4 order-2 xl:order-1 mb-2 overflow-y-scroll'
                >
                  <Overview />
                </div>
                <div
                  id='analysisPage'
                  className='xl:w-2/5 p-4 order-2 xl:order-1 overflow-y-scroll hidden'
                >
                  <Analysis />
                </div>
              </>
            ) : (
              <h1 className='xl:w-2/5 p-4 order-2 xl:order-1 mb-2' id='visual4'>
                <div>
                  <ThemeProvider theme={skeletonTheme}>
                    <Stack
                      direction='column'
                      justifyContent='center'
                      alignItems='stretch'
                      spacing={2}
                    >
                      <Stack
                        direction='row'
                        justifyContent='center'
                        alignItems='center'
                        spacing={2}
                      >
                        <Skeleton
                          variant='rounded'
                          animation='wave'
                          height={70}
                          width='100%'
                        />
                        <Skeleton
                          variant='rounded'
                          animation='wave'
                          height={70}
                          width='100%'
                        />
                        <Skeleton
                          variant='rounded'
                          animation='wave'
                          height={70}
                          width='100%'
                        />
                      </Stack>
                      <Skeleton
                        variant='rounded'
                        animation='wave'
                        height={80}
                        width='100%'
                      />
                      <Skeleton
                        variant='rounded'
                        animation='wave'
                        height={130}
                        width='100%'
                      />
                      <Skeleton
                        variant='rounded'
                        animation='wave'
                        height={120}
                        width='100%'
                      />
                      {Array.from({ length: 4 }).map((_, index) => (
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
                </div>
              </h1>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
