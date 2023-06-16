import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useState } from "react";
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
    secondary: {
      main: "#78bcfe",
      dark: "#8bc2ff",
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
  const [boundary, setBoundary] = useState(false);

  const columns = [
    {
      width: 120,
      label: "จังหวัด",
      dataKey: "province",
      align: "left",
    },
    {
      width: 110,
      label: "จำนวนจุด",
      dataKey: "spot",
    },
    {
      width: 105,
      label: "รายเขต/อำเภอ",
      dataKey: "district",
      renderButton: true,
    },
    {
      width: 135,
      label: "ข้อมูลเมื่อวันที่",
      dataKey: "date",
    },
  ];

  function createData(id, province, district, spot, date) {
    return {
      id,
      province,
      district,
      spot,
      date,
    };
  }

  const sample = [
    ["กรุงเทพมหานคร", 6.0, 24, 4.0],
    ["ภูเก็ต", 9.0, 37, 4.3],
    ["เชียงใหม่", 16.0, 24, 6.0],
    ["นครศรีธรรมราช", 3.7, 67, 4.3],
    ["นนทบุรี", 16.0, 49, 3.9],
  ];

  const rows = Array.from({ length: 77 }, (_, index) => {
    const randomSelection = sample[Math.floor(Math.random() * sample.length)];
    return createData(index, ...randomSelection);
  });

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
            onClick={() => setBoundary(!boundary)}
            color={boundary ? "secondary" : "primary"}
          >
            {boundary ? t("hideProvinceBoundary") : t("showProvinceBoundary")}
          </Button>
        </ThemeProvider>
        <ThemeProvider theme={dropdownTheme}>
          <Dropdown label={t("month")} items={months} />
        </ThemeProvider>
      </div>
      <div className="">
        <Tablesort columns={columns} rows={rows} height="620px" />
      </div>
    </div>
  );
}

export default DetailHotspot;
