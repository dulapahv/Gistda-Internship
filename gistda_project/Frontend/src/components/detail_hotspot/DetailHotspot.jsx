import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Dropdown, Tablesort } from "..";

const months = [
  "months.jan",
  "months.feb",
  "months.mar",
  "months.apr",
  "months.may",
  "months.jun",
  "months.jul",
  "months.aug",
  "months.sep",
  "months.oct",
  "months.nov",
  "months.dec",
];

const buttonTheme = createTheme({
  palette: {
    primary: {
      main: "#F390B0",
      dark: "#FF99BA",
      contrastText: "#ffffff",
    },
  },
  typography: {
    fontFamily: ["Kanit", "sans-serif"].join(","),
    fontSize: 15,
  },
});

const dropdownTheme = createTheme({
  palette: {
    primary: {
      main: "#F390B0",
    },
  },
  typography: {
    fontFamily: ["Kanit", "sans-serif"].join(","),
  },
});

function DetailHotspot() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <ThemeProvider theme={buttonTheme}>
          <Button
            variant="contained"
            sx={{
              height: "100%",
              width: "100%",
              minHeight: "50px",
            }}
            className="!capitalize"
          >
            {t("toggleProvinceBoundary")}
          </Button>
        </ThemeProvider>
        <ThemeProvider theme={dropdownTheme}>
          <Dropdown label={t("month")} items={months} />
        </ThemeProvider>
      </div>
      <div className="">
        <Tablesort height="620px" />
      </div>
    </div>
  );
}

export default DetailHotspot;
