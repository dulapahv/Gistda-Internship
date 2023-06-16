import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import * as React from "react";
import { useTranslation } from "react-i18next";

function Dropdown({ label, items }) {
  const { t } = useTranslation();

  const [item, setItem] = React.useState(items[0]);

  const handleChange = (event) => {
    setItem(event.target.value);
  };

  return (
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
  );
}

export default Dropdown;
