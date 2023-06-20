import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import ToggleButton from '@mui/material/ToggleButton';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import {
  DetailAgri,
  DetailAll,
  DetailHotspot,
  map,
  Map,
  sphere,
} from '../components';

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

const showElement = (show, hide1, hide2) => {
  hide1.classList.add('hidden');
  hide2.classList.add('hidden');
  show.classList.remove('hidden');
};

const showHotspot = () => {
  const hotspot = document.getElementById('hotspot');
  const agri = document.getElementById('agri');
  const all = document.getElementById('all');
  showElement(hotspot, agri, all);
};

const showAgri = () => {
  const hotspot = document.getElementById('hotspot');
  const agri = document.getElementById('agri');
  const all = document.getElementById('all');
  showElement(agri, hotspot, all);
};

const showAll = () => {
  const hotspot = document.getElementById('hotspot');
  const agri = document.getElementById('agri');
  const all = document.getElementById('all');
  showElement(all, hotspot, agri);
};

export default function Visual() {
  const { t } = useTranslation();

  const [alignment, setAlignment] = React.useState('left');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const handleAlignment = (event, newAlignment) => {
    if (!newAlignment) return;
    setAlignment(newAlignment);
    switch (newAlignment) {
      case 'left':
        showHotspot();
        break;
      case 'center':
        showAgri();
        break;
      case 'right':
        showAll();
        break;
      default:
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

  return (
    <div className='flex flex-col h-auto drop-shadow-xl space-y-10'>
      <div className='flex flex-row justify-center'>
        <div className='flex flex-col order-2 sm:flex-row'>
          <ThemeProvider theme={ToggleButtonGroupTheme}>
            <ToggleButtonGroup
              color='primary'
              value={alignment}
              exclusive
              onChange={handleAlignment}
            >
              <ToggleButton value='left' className='!capitalize'>
                {t('map_type.hotspot')}
              </ToggleButton>
              <ToggleButton value='center' className='!capitalize'>
                {t('map_type.agri')}
              </ToggleButton>
              <ToggleButton value='right' className='!capitalize'>
                {t('map_type.all')}
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
          <Map mapStyle='h-[500px] min-[425px]:h-[550px] md:h-[725px] z-0' />
        </div>
        <div id='hotspot' className='xl:w-2/5 xl:order-first p-4'>
          <DetailHotspot />
        </div>
        <div id='agri' className='xl:w-2/5 xl:order-first p-4 hidden'>
          <DetailAgri />
        </div>
        <div id='all' className='xl:w-2/5 xl:order-first p-4 hidden'>
          <DetailAll />
        </div>
      </div>
    </div>
  );
}
