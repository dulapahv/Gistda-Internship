import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import LightModeIcon from '@mui/icons-material/LightMode';
import TranslateIcon from '@mui/icons-material/Translate';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { map } from '../../components';

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
    const initialValue = JSON.parse(saved);
    return initialValue || 'light';
  });
  const { t, i18n } = useTranslation();

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  if (map) map.language(i18n.language === 'th' ? 'th' : 'en');

  return (
    <div className='flex flex-row bg-[#FB568A] h-auto flex-wrap px-5 pt-2 items-center'>
      <h1 className='grow font-kanit text-white font-light text-xl mr-8'>
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
  );
}
