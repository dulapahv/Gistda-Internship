import React, { useEffect, useState } from 'react';

import axios from 'axios';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { TableVirtuoso } from 'react-virtuoso';

import * as turf from '@turf/turf';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { map } from '../components';

const baseURL = 'http://localhost:3001/';

const tableTheme = createTheme({
  palette: {
    mode: JSON.parse(localStorage.getItem('theme')),
    primary: {
      main: '#F390B0',
      dark: '#FF99BA',
      contrastText: '#ffffff',
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
  const [columnsData, setColumnsData] = useState([columns]);
  const [rowData, setRowData] = useState([rows]);
  const [district, setDistrict] = useState();
  const [subDistrict, setSubDistrict] = useState();
  const [sortConfig, setSortConfig] = useState({
    key: colSortDefault,
    direction: 'desc',
  });
  const [colDisabled, setColDisabled] = useState(colSortDisabled);
  const [date, setDate] = useState(dayjs('2023-03-06'));
  const [zoom, setZoom] = useState([
    {
      minLon: 97.345,
      minLat: 5.612,
      maxLon: 105.819,
      maxLat: 20.464,
    },
  ]);

  function handleClick2(event) {
    event.preventDefault();
    console.info('You clicked a breadcrumb.');
  }

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
      const zoomTemp = [
        ...zoom,
        {
          minLon: bbox[0],
          minLat: bbox[1],
          maxLon: bbox[2],
          maxLat: bbox[3],
        },
      ];
      setZoom(zoomTemp);
      map.bound(zoomTemp.slice(-1)[0]);
    } else {
      console.log('No valid coordinates found.');
    }
  }, [coordinates]);

  function createDataDistrict(
    id,
    province,
    district,
    hotspot,
    subDistrict,
    time,
    date
  ) {
    return {
      id,
      province,
      district,
      subDistrict,
      hotspot: 1,
      time,
      date,
    };
  }

  useEffect(() => {
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
            createDataDistrict(
              item.ap_idn,
              item.pv_tn,
              `${i18n.language === 'th' ? item.ap_tn : item.ap_en}`,
              `${i18n.language === 'th' ? item.tb_tn : item.tb_en}`,
              1,
              formattedTime,
              date.format('DD-MM-YY')
            )
          );
        }
      });

      const tempCol = [
        {
          width: 120,
          label: t('district'),
          dataKey: 'district',
          align: 'left',
        },
        {
          width: 130,
          label: t('hotspot'),
          dataKey: 'hotspot',
        },
        {
          width: 100,
          label: t('subDistrict'),
          dataKey: 'subDistrict',
          renderButton: true,
        },
        {
          width: 110,
          label: t('time'),
          dataKey: 'time',
        },
      ];

      setColumnsData([...columnsData, tempCol]);
      setRowData([...rowData, Array.from(rowsMap.values())]);
      setColDisabled([colDisabled, 'subDistrict']);
    }
  }, [district]);

  function createDataSubDistrict(
    id,
    district,
    subDistrict,
    hotspot,
    time,
    date
  ) {
    return {
      id,
      district,
      subDistrict,
      hotspot: 1,
      time,
      date,
    };
  }

  useEffect(() => {
    if (subDistrict) {
      const rowsMap = new Map();

      subDistrict.result.forEach((item) => {
        const key = item.tb_en;
        const hour = item.th_time.toString().slice(0, 2).padStart(2, '0');
        const minute = item.th_time.toString().slice(2, 4).padStart(2, '0');
        const formattedTime = `${hour}:${minute}`;
        if (rowsMap.has(key)) {
          rowsMap.get(key).hotspot++;
        } else {
          rowsMap.set(
            key,
            createDataSubDistrict(
              item.tb_idn,
              item.ap_tn,
              `${i18n.language === 'th' ? item.tb_tn : item.tb_en}`,
              1,
              formattedTime,
              date.format('DD-MM-YY')
            )
          );
        }
      });

      const tempCol = [
        {
          width: 120,
          label: t('subDistrict'),
          dataKey: 'subDistrict',
          align: 'left',
        },
        {
          width: 130,
          label: t('hotspot'),
          dataKey: 'hotspot',
        },
        {
          width: 110,
          label: t('time'),
          dataKey: 'time',
        },
      ];

      setColumnsData([...columnsData, tempCol]);
      setRowData([...rowData, Array.from(rowsMap.values())]);
      setColDisabled([colDisabled, '']);
    }
  }, [subDistrict]);

  const handleClick = (row) => {
    setDate(dayjs(row.date, 'DD-MM-YY'));
    if (!district) {
      fetchData({
        query: `data=thai_coord&select=lat,long&where=ch_id='${row.id}'`,
        setData: setCoordinates,
      });

      fetchData({
        query: `data=hotspot_2023${date.format(
          'MM'
        )}&select=latitude,longitude,lu_hp,ap_tn,tb_tn,ap_en,tb_en,tb_idn,pv_en,pv_tn,ap_idn,th_time&where=acq_date='${
          row.date
        }'AND pv_idn='${row.id}'`,
        setData: setDistrict,
      });
    } else {
      fetchData({
        query: `data=thai_coord&select=lat,long&where=am_id='${row.id}'`,
        setData: setCoordinates,
      });

      fetchData({
        query: `data=hotspot_2023${date.format(
          'MM'
        )}&select=latitude,longitude,lu_hp,tb_tn,tb_en,ap_tn,ap_en,tb_idn,th_time&where=acq_date='${
          row.date
        }'AND ap_idn='${row.id}'`,

        setData: setSubDistrict,
      });
    }
  };

  const goBack = () => {
    if (district && subDistrict) setSubDistrict();
    else if (district) setDistrict();
    else setSubDistrict();
    columnsData.pop();
    rowData.pop();
    colDisabled.pop();
    zoom.pop();
    setColumnsData(columnsData);
    setRowData(rowData);
    setColDisabled(colDisabled.slice(-1)[0]);
    map.bound(zoom.slice(-1)[0]);
  };

  function fixedHeaderContent() {
    if (!columnsData.slice(-1)[0]) return null;

    const requestSort = (key) => {
      if (colDisabled.slice(-1)[0].includes(key.dataKey)) {
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
        {columnsData.slice(-1)[0].map((column, columnIndex) => (
          <TableCell
            key={column.dataKey}
            variant='head'
            align={column.align || 'center'}
            style={{ width: column.width }}
            className={`bg-[#f7eff2] dark:bg-[#2c2c2c] cursor-${
              colDisabled.slice(-1)[0].includes(column.dataKey)
                ? 'default'
                : 'pointer'
            } ${
              !colDisabled.slice(-1)[0].includes(column.dataKey)
                ? 'hover:bg-[#f7e8ec] dark:hover:bg-[#4b3b40]'
                : ''
            } ${
              colDisabled.slice(-1)[0].includes(column.dataKey)
                ? 'pointer-events-none'
                : 'pointer-events-auto'
            }`}
            onClick={() => requestSort(column.dataKey)}
          >
            {!colDisabled.slice(-1)[0].includes(column.dataKey) ? (
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
        {columnsData.slice(-1)[0].map((column, columnIndex) => (
          <TableCell
            key={column.dataKey}
            align={column.align || 'center'}
            className={rowClasses}
          >
            {column.renderButton ? (
              <IconButton size='small' onClick={() => handleClick(row)}>
                <ManageSearchIcon />
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
    rowData.slice(-1)[0] &&
    rowData.slice(-1)[0].sort((a, b) => {
      if (sortConfig.direction === 'asc')
        return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
      if (sortConfig.direction === 'desc')
        return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
      return 0;
    });

  const dat = sortConfig.key ? sortedRows : rowData.slice(-1)[0];
  return (
    <ThemeProvider theme={tableTheme}>
      <Paper
        style={{
          height: district || subDistrict ? 'calc(100% - 40px)' : '100%',
          width: '100%',
        }}
      >
        <TableVirtuoso
          data={dat}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
        />
      </Paper>
      {district || subDistrict ? (
        <div className='flex flex-row mt-[14px] items-center space-x-4'>
          <div>
            <Button
              variant='contained'
              startIcon={<ArrowBackIosIcon />}
              onClick={goBack}
            >
              {t('back')}
            </Button>
          </div>
          <div>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize='small' />}
              aria-label='breadcrumb'
            >
              <Link
                underline='hover'
                color='inherit'
                onClick={() => {
                  setDistrict();
                  setSubDistrict();
                  setZoom([
                    {
                      minLon: 97.345,
                      minLat: 5.612,
                      maxLon: 105.819,
                      maxLat: 20.464,
                    },
                  ]);
                  setRowData([rows]);
                  setColumnsData([columns]);
                  setSortConfig({
                    key: colSortDefault,
                    direction: 'desc',
                  });
                  setColDisabled(colSortDisabled);
                  map.bound(zoom[0]);
                }}
                className='cursor-pointer'
              >
                {t('thailand')}
              </Link>
              {district ? (
                <Link
                  underline={subDistrict ? 'hover' : 'none'}
                  color={subDistrict ? 'inherit' : 'text.primary'}
                  onClick={subDistrict ? goBack : null}
                  className={subDistrict ? 'cursor-pointer' : ''}
                >
                  {district
                    ? i18n.language === 'th'
                      ? district.result[0].pv_tn
                      : district.result[0].pv_en
                    : ''}
                </Link>
              ) : (
                ''
              )}
              {subDistrict ? (
                <Link
                  underline='none'
                  color={subDistrict ? 'text.primary' : 'inherit'}
                >
                  {subDistrict
                    ? i18n.language === 'th'
                      ? subDistrict.result[0].ap_tn
                      : subDistrict.result[0].ap_en
                    : ''}
                </Link>
              ) : (
                ''
              )}
            </Breadcrumbs>
          </div>
        </div>
      ) : (
        ''
      )}
    </ThemeProvider>
  );
}
