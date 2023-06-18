import * as React from "react";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const DropdownTheme = createTheme({
  palette: {
    mode: JSON.parse(localStorage.getItem("theme")),
    primary: {
      main: "#F390B0",
    },
  },
  typography: {
    fontFamily: ["Kanit", "sans-serif"].join(","),
  },
});

function Dropdown({ label, items }) {
  const { t } = useTranslation();

  const [item, setItem] = React.useState(items[0]);

  const handleChange = (event) => {
    setItem(event.target.value);
  };

  return (
    <ThemeProvider theme={DropdownTheme}>
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">{label}</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={t(item)}
            label={label}
            onChange={handleChange}
          >
            {items.map((item) => (
              <MenuItem value={t(item)} key={t(item)}>
                {t(item)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </ThemeProvider>
  );
}

export default Dropdown;
