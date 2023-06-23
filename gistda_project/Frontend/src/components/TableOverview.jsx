import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { TableVirtuoso } from 'react-virtuoso';

import axios from 'axios';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import { visuallyHidden } from '@mui/utils';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

import { map, sphere } from '../components';

const baseURL = 'http://localhost:3001/';

const tableTheme = createTheme({
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

const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table {...props} className='border-collapse-separate table-fixed' />
  ),
  TableHead,
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
  TableBody: React.forwardRef((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

export default function Tablesort({
  columns,
  rows,
  height = '100vh',
  colSortDisabled,
  colSortDefault,
}) {
  const { t } = useTranslation();

  const [sortConfig, setSortConfig] = useState({
    key: colSortDefault,
    direction: 'desc',
  });

  const fetchData = async ({ row }) => {
    try {
      const response = await axios.get(
        `${baseURL}?data=thai_coord&select=lat,long&where=ch_id='${row.id}'`
      );
      setData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const [data, setData] = useState();

  useEffect(() => {
    if (data && data.result && data.result.length > 0) {
      map.goTo({
        center: { lon: data.result[0].long, lat: data.result[0].lat },
        zoom: 10,
      });
    }
  }, [data]);

  const handleButtonClick = (row) => {
    fetchData({ row });
  };

  function fixedHeaderContent() {
    if (!columns) return null;

    const requestSort = (key) => {
      if (colSortDisabled.includes(key.dataKey)) {
        return;
      }

      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    };

    return (
      <TableRow>
        <TableCell
          key='running-number'
          variant='head'
          align='center'
          style={{ width: '60px' }}
          className='bg-[#f7eff2] dark:bg-[#2c2c2c]'
        >
          <Typography variant='subtitle1' color='primary'>
            {t('rank')}
          </Typography>
        </TableCell>
        {columns.map((column, columnIndex) => (
          <TableCell
            key={column.dataKey}
            variant='head'
            align={column.align || 'center'}
            style={{ width: column.width }}
            className={`bg-[#f7eff2] dark:bg-[#2c2c2c] cursor-${
              colSortDisabled.includes(column.dataKey) ? 'default' : 'pointer'
            } ${
              !colSortDisabled.includes(column.dataKey)
                ? 'hover:bg-[#f7e8ec] dark:hover:bg-[#4b3b40]'
                : ''
            } ${
              colSortDisabled.includes(column.dataKey)
                ? 'pointer-events-none'
                : 'pointer-events-auto'
            }`}
            onClick={() => requestSort(column.dataKey)}
          >
            {!colSortDisabled.includes(column.dataKey) ? (
              <TableSortLabel
                active={sortConfig.key === column.dataKey}
                direction={
                  sortConfig.key === column.dataKey
                    ? sortConfig.direction
                    : 'asc'
                }
              >
                <Typography variant='subtitle1' color='primary'>
                  {column.label}
                </Typography>
                {sortConfig.key === column.dataKey && (
                  <Box component='span' sx={visuallyHidden}>
                    {sortConfig.direction === 'desc'
                      ? 'sorted descending'
                      : 'sorted ascending'}
                  </Box>
                )}
              </TableSortLabel>
            ) : (
              <Typography variant='subtitle1' color='primary'>
                {column.label}
              </Typography>
            )}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  function rowContent(index, row) {
    const rowClasses =
      index % 2 === 0
        ? 'bg-gray-100 dark:bg-[#555555]'
        : 'bg-white dark:bg-[#6c6c6c]';
    const runningNumber = index + 1;

    return (
      <>
        <TableCell align='center' className={rowClasses}>
          <Typography variant='body1'>{runningNumber}</Typography>
        </TableCell>
        {columns.map((column, columnIndex) => (
          <TableCell
            key={column.dataKey}
            align={column.align || 'center'}
            className={rowClasses}
          >
            {column.renderButton ? (
              <IconButton size='small' onClick={() => handleButtonClick(row)}>
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
      if (sortConfig.direction === 'asc')
        return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
      if (sortConfig.direction === 'desc')
        return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
      return 0;
    });

  const dat = sortConfig.key ? sortedRows : rows;

  return (
    <Paper style={{ height, width: '100%' }}>
      <ThemeProvider theme={tableTheme}>
        <TableVirtuoso
          data={dat}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
        />
      </ThemeProvider>
    </Paper>
  );
}
