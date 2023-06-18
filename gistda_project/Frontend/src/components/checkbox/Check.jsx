import React from "react";

import { useTranslation } from "react-i18next";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const FormControlLabelTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#F390B0",
    },
  },
  typography: {
    fontFamily: ["Kanit", "sans-serif"].join(","),
  },
});

function Check({ label }) {
  const { t } = useTranslation();

  return (
    <div>
      <ThemeProvider theme={FormControlLabelTheme}>
        <FormControlLabel
          control={<Checkbox defaultChecked />}
          label={t(label)}
          className="dark:text-white"
        />
      </ThemeProvider>
    </div>
  );
}

export default Check;
