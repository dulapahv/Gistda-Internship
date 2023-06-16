// import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from "@mui/icons-material/LightMode";
import TranslateIcon from "@mui/icons-material/Translate";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { map } from "../../components";

const buttonTheme = createTheme({
  palette: {
    primary: {
      main: "#FFFFFF",
    },
  },
});

function Banner() {
  // const [theme, setTheme] = useState('light');

  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  if (map) map.language(i18n.language === "th" ? "th" : "en");

  return (
    <div className="flex flex-row bg-[#FB568A] h-auto flex-wrap rounded-br-full px-5 py-2 items-center">
      <h1 className="grow font-kanit text-white font-light text-xl mr-8">
        {t("banner")}
      </h1>
      <Stack direction="row">
        <ThemeProvider theme={buttonTheme}>
          <Tooltip title="Switch language">
            <IconButton
              onClick={() => {
                i18n.language === "en"
                  ? changeLanguage("th")
                  : changeLanguage("en");
              }}
            >
              <TranslateIcon color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Switch theme">
            <IconButton>
              <LightModeIcon color="primary" />
            </IconButton>
          </Tooltip>
        </ThemeProvider>
      </Stack>
    </div>
  );
}

export default Banner;
