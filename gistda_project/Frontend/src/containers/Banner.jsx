import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import LightModeIcon from '@mui/icons-material/LightMode';
import TranslateIcon from '@mui/icons-material/Translate';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { map } from '../components';

const buttonTheme = createTheme({
  palette: {
    primary: {
      main: '#FFFFFF',
    },
  },
});

export default function Banner() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    const initialValue = saved;
    return initialValue || 'light';
  });
  const { t, i18n } = useTranslation();

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  map?.language(i18n.language === 'th' ? 'th' : 'en');

  return (
    <>
      <div className='flex flex-row bg-[#FB568A] h-auto flex-wrap px-5 pt-2 items-center'>
        <h1 className='grow font-kanit text-white font-light text-xl mr-8 capitalize'>
          {t('banner')}
        </h1>
        <Stack direction='row'>
          <ThemeProvider theme={buttonTheme}>
            <Tooltip title='Switch language'>
              <IconButton
                onClick={() => {
                  i18n.language === 'en'
                    ? changeLanguage('th')
                    : changeLanguage('en');
                }}
              >
                <TranslateIcon color='primary' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Switch theme'>
              <IconButton
                onClick={() => {
                  theme === 'light' ? setTheme('dark') : setTheme('light');
                  window.location.reload();
                }}
              >
                {theme === 'light' ? (
                  <LightModeIcon color='primary' />
                ) : (
                  <NightsStayIcon color='primary' />
                )}
              </IconButton>
            </Tooltip>
          </ThemeProvider>
        </Stack>
      </div>
      <div className='overflow-hidden'>
        <svg
          preserveAspectRatio='none'
          viewBox='0 0 1200 120'
          xmlns='http://www.w3.org/2000/svg'
          style={{ fill: '#f7588a', width: '125%', height: 75 }}
        >
          <path
            d='M0 0v46.29c47.79 22.2 103.59 32.17 158 28 70.36-5.37 136.33-33.31 206.8-37.5 73.84-4.36 147.54 16.88 218.2 35.26 69.27 18 138.3 24.88 209.4 13.08 36.15-6 69.85-17.84 104.45-29.34C989.49 25 1113-14.29 1200 52.47V0z'
            opacity='.25'
          />
          <path
            d='M0 0v15.81c13 21.11 27.64 41.05 47.69 56.24C99.41 111.27 165 111 224.58 91.58c31.15-10.15 60.09-26.07 89.67-39.8 40.92-19 84.73-46 130.83-49.67 36.26-2.85 70.9 9.42 98.6 31.56 31.77 25.39 62.32 62 103.63 73 40.44 10.79 81.35-6.69 119.13-24.28s75.16-39 116.92-43.05c59.73-5.85 113.28 22.88 168.9 38.84 30.2 8.66 59 6.17 87.09-7.5 22.43-10.89 48-26.93 60.65-49.24V0z'
            opacity='.5'
          />
          <path d='M0 0v5.63C149.93 59 314.09 71.32 475.83 42.57c43-7.64 84.23-20.12 127.61-26.46 59-8.63 112.48 12.24 165.56 35.4C827.93 77.22 886 95.24 951.2 90c86.53-7 172.46-45.71 248.8-84.81V0z' />
        </svg>
      </div>
    </>
  );
}
