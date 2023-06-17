import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { TableVirtuoso } from "react-virtuoso";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import { visuallyHidden } from "@mui/utils";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TableSortLabel from "@mui/material/TableSortLabel";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";

const handleButtonClick = (row) => {
  console.log(row);
};

const tableTheme = createTheme({
  palette: {
    primary: {
      main: "#F390B0",
    },
  },
  typography: {
    fontFamily: ["Kanit", "sans-serif"].join(","),
    fontSize: 15,
  },
});

const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      sx={{ borderCollapse: "separate", tableLayout: "fixed" }}
    />
  ),
  TableHead,
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
  TableBody: React.forwardRef((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

function Tablesort({
  columns,
  rows,
  height = "100vh",
  colSortDisabled,
  colSortDefault,
}) {
  const { t } = useTranslation();

  const [sortConfig, setSortConfig] = useState({
    key: colSortDefault,
    direction: "desc",
  });

  function fixedHeaderContent() {
    if (!columns) return null;

    const requestSort = (key) => {
      if (colSortDisabled.includes(key.dataKey)) {
        return;
      }

      let direction = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      }
      setSortConfig({ key, direction });
    };

    return (
      <TableRow>
        <TableCell
          key="running-number"
          variant="head"
          align="center"
          style={{ width: "60px" }}
          sx={{
            backgroundColor: "#f7eff2",
          }}
        >
          <Typography variant="subtitle1" color="primary">
            {t("rank")}
          </Typography>
        </TableCell>
        {columns.map((column, columnIndex) => (
          <TableCell
            key={column.dataKey}
            variant="head"
            align={column.align || "center"}
            style={{ width: column.width }}
            sx={{
              backgroundColor: "#f7eff2",
              cursor: !colSortDisabled.includes(column.dataKey)
                ? "pointer"
                : "default",
              "&:hover": {
                backgroundColor: !colSortDisabled.includes(column.dataKey)
                  ? "#f7e8ec"
                  : "inherit",
              },
              pointerEvents: colSortDisabled.includes(column.dataKey)
                ? "none"
                : "auto",
            }}
            onClick={() => requestSort(column.dataKey)}
          >
            {!colSortDisabled.includes(column.dataKey) ? (
              <TableSortLabel
                active={sortConfig.key === column.dataKey}
                direction={
                  sortConfig.key === column.dataKey
                    ? sortConfig.direction
                    : "asc"
                }
              >
                <Typography variant="subtitle1" color="primary">
                  {column.label}
                </Typography>
                {sortConfig.key === column.dataKey && (
                  <Box component="span" sx={visuallyHidden}>
                    {sortConfig.direction === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                )}
              </TableSortLabel>
            ) : (
              <Typography variant="subtitle1" color="primary">
                {column.label}
              </Typography>
            )}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  function rowContent(index, row) {
    const rowClasses = index % 2 === 0 ? "bg-gray-100" : "bg-white ";
    const runningNumber = index + 1;

    return (
      <>
        <TableCell align="center" className={rowClasses}>
          <Typography variant="body1">{runningNumber}</Typography>
        </TableCell>
        {columns.map((column, columnIndex) => (
          <TableCell
            key={column.dataKey}
            align={column.align || "center"}
            className={rowClasses}
          >
            {column.renderButton ? (
              <IconButton size="small" onClick={() => handleButtonClick(row)}>
                <FormatListNumberedIcon />
              </IconButton>
            ) : (
              row[column.dataKey]
            )}
          </TableCell>
        ))}
      </>
    );
  }

  const sortedRows =
    rows &&
    rows.sort((a, b) => {
      if (sortConfig.direction === "asc")
        return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
      if (sortConfig.direction === "desc")
        return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
      return 0;
    });

  const data = sortConfig.key ? sortedRows : rows;

  return (
    <Paper style={{ height, width: "100%" }}>
      <ThemeProvider theme={tableTheme}>
        <TableVirtuoso
          data={data}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
        />
      </ThemeProvider>
    </Paper>
  );
}

export default Tablesort;
