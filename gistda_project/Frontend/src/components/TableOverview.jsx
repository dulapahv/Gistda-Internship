import React, { useEffect, useState } from 'react';

import axios from 'axios';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { TableVirtuoso } from 'react-virtuoso';

import * as turf from '@turf/turf';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
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
  const { t, i18n } = useTranslation();
  const [coordinates, setCoordinates] = useState();
  const [rowData, setRowData] = useState(rows);
  const [district, setDistrict] = useState();
  const [subDistrict, setSubDistrict] = useState();
  const [sortConfig, setSortConfig] = useState({
    key: colSortDefault,
    direction: 'desc',
  });
  const [date, setDate] = useState();
  const [time, setTime] = useState();

  const fetchData = async ({ query, setData }) => {
    // setIsTableLoaded(false);
    axios
      .get(`${baseURL}?${query}`)
      .then(function (response) {
        setData(response.data);
        // setIsTableLoaded(true);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    if (!coordinates) return;

    const points = [];

    coordinates.result.forEach((coord) => {
      const lat = parseFloat(coord.lat);
      const lon = parseFloat(coord.long);

      if (!isNaN(lat) && !isNaN(lon)) {
        const point = turf.point([lon, lat]);
        points.push(point);
      }
    });

    if (points.length > 0) {
      const bbox = turf.bbox(turf.featureCollection(points));
      sphere.Bound = {
        minLon: bbox[0],
        minLat: bbox[1],
        maxLon: bbox[2],
        maxLat: bbox[3],
      };
      map.bound(sphere.Bound);
    } else {
      console.log('No valid coordinates found.');
    }
  }, [coordinates]);

  function createData(id, province, district, hotspot, time) {
    return {
      id,
      province,
      district,
      hotspot: 1,
      time,
    };
  }

  useEffect(() => {
    console.log(district);
    if (district) {
      const rowsMap = new Map();

      district.result.forEach((item) => {
        const key = item.ap_en;
        const hour = item.th_time.toString().slice(0, 2).padStart(2, '0');
        const minute = item.th_time.toString().slice(2, 4).padStart(2, '0');
        const formattedTime = `${hour}:${minute}`;
        if (rowsMap.has(key)) {
          rowsMap.get(key).hotspot++;
        } else {
          rowsMap.set(
            key,
            createData(
              item.pv_idn,
              `${i18n.language === 'th' ? item.ap_tn : item.ap_en}`,
              `${i18n.language === 'th' ? item.tb_tn : item.tb_en}`,
              1,
              formattedTime
            )
          );
        }
      });

      console.log(rowsMap);

      setRowData(Array.from(rowsMap.values()));
    }
  }, [district]);

  const handlePvClick = (row) => {
    fetchData({
      query: `data=thai_coord&select=lat,long&where=ch_id='${row.id}'`,
      setData: setCoordinates,
    });

    // const month = dayjs(row.date, 'DD-MM-YY').format('MM');
    // fetchData({
    //   query: `data=hotspot_2023${month}&select=latitude,longitude,lu_hp,pv_tn,ap_tn,tb_tn,pv_en,ap_en,tb_en,pv_idn,th_time&where=acq_date='${row.date}'AND pv_idn='${row.id}'`,
    //   setData: setDistrict,
    // });
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
                  <Box component='span' className='hidden'>
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
              <IconButton size='small' onClick={() => handlePvClick(row)}>
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
    rowData &&
    rowData.sort((a, b) => {
      if (sortConfig.direction === 'asc')
        return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
      if (sortConfig.direction === 'desc')
        return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
      return 0;
    });

  const dat = sortConfig.key ? sortedRows : rowData;
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
