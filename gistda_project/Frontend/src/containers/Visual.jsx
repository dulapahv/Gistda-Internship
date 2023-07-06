import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
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

const skeletonTheme = createTheme({
  palette: {
    mode: JSON.parse(localStorage.getItem('theme')),
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
    map.bound(
      {
        minLon: 97.343699,
        minLat: 5.612738,
        maxLon: 105.636781,
        maxLat: 20.464926,
      },
      { padding: { top: 7, bottom: 7 } }
    );
    if (!window.sphereDrawLoaded) {
      window.sphereDrawLoaded = true;
      window.sphere.Util.loadStyle(
        sphere.Server.map + '/js/mapbox-gl-draw.css'
      );
      window.sphere.Util.loadScript(
        sphere.Server.map + '/js/mapbox-gl-draw.js',
        () => {
          // see more options https://github.com/mapbox/mapbox-gl-draw/blob/main/docs/API.md#options
          const drawOptions = {
            controls: {
              point: false,
              line_string: false,
              polygon: true,
              trash: true,
              combine_features: true,
              uncombine_features: false,
            },
          };
          var drawPanel = new window.MapboxDraw(drawOptions);
          map.Renderer.addControl(drawPanel, 'top-right'); // see details https://docs.mapbox.com/mapbox-gl-js/api/#map#addcontrol
        }
      );
    }
  }

  return (
    <div className='px-5 h-fit xl:h-screen xl:mb-44 min-h-[820px]'>
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
                <ToggleButton value='overviewPage' className='!capitalize'>
                  <PublicIcon className='mr-2' />
                  {t('map_type.overall')}
                </ToggleButton>
                <ToggleButton value='analysisPage' className='!capitalize'>
                  <TravelExploreIcon className='mr-2' />
                  {t('map_type.analysis')}
                </ToggleButton>
              </ToggleButtonGroup>
            </ThemeProvider>
          </div>
        </div>
        <div className='flex flex-col xl:flex-row mb-4 bg-white rounded-lg dark:bg-[#444444] h-full'>
          <div className='xl:w-3/5 relative flex-grow order-1 xl:order-2 aspect-square'>
            {!isMapLoaded && (
              <ThemeProvider theme={LinearProgressTheme}>
                <div className='w-full absolute z-10 pt-[0.4px]'>
                  <LinearProgress className='rounded-t-lg xl:rounded-none xl:rounded-tr-lg' />
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
            <h1 className='xl:w-2/5 p-4 order-2 xl:order-1 mb-2'>
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
                    {Array.from({ length: 6 }).map((_, index) => (
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
  );
}
