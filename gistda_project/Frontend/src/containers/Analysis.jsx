import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js';

import * as turf from '@turf/turf';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { getDots } from '.';
import apList from './amphoe.json';
import tbList from './tambon.json';
import pvList from './province.json';
import { map, sphere } from '../components';

const baseURL = 'http://localhost:3001/';

const selectTheme = createTheme({
  palette: {
    mode: JSON.parse(localStorage.getItem('theme')),
    primary: {
      main: '#F390B0',
    },
  },
  typography: {
    fontFamily: ['Kanit', 'sans-serif'].join(','),
  },
});

const buttonTheme = createTheme({
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
    fontSize: 16,
  },
});

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels, Title);
ChartJS.defaults.color = '#fff';
ChartJS.defaults.font.family = 'kanit';

let {
  riceCount = 0,
  maizeCount = 0,
  sugarcaneCount = 0,
  otherCropCount = 0,
  forestAreaCount = 0,
  otherCount = 0,
} = {};

export default function Analysis() {
  const { t, i18n } = useTranslation();
  const [area, setArea] = useState(0);
  const [dotCount, setDotCount] = useState(0);
  const [province, setProvince] = useState(10);
  const [provinceList, setProvinceList] = useState(pvList);
  const [district, setDistrict] = useState(0);
  const [districtList, setDistrictList] = useState([]);
  const [subDistrict, setSubDistrict] = useState(0);
  const [subDistrictList, setSubDistrictList] = useState([]);

  const options = {
    plugins: {
      title: {
        display: true,
        text: t('amountHotspotInLandType'),
        font: {
          size: 20,
        },
      },
      legend: {
        labels: {
          font: {
            size: 16,
          },
        },
      },
      tooltip: {
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
      },
      datalabels: {
        font: {
          size: 14,
        },
        formatter: (value, context) => {
          return value > 0
            ? value +
                ' ' +
                t('spot') +
                (value > 1 && i18n.language === 'en' ? 's' : '')
            : '';
        },
      },
    },
  };

  const fetchData = async ({ query, setData }) => {
    axios
      .get(`${baseURL}?${query}`)
      .then(function (response) {
        setData(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const fetchProvinceList = async () => {
    const query =
      'data=thai_coord&select=distinct(ch_id),changwat_e&order=province';
    fetchData({ query, setData: setProvinceList });
  };

  useEffect(() => {
    const handleDrawCreate = (e) => {
      if (e.features && e.features[0].geometry.coordinates.length === 1) {
        setArea(turf.area(e.features[0]));
        let count = 0;
        resetDotCount();
        for (let i = 0; i < e.features[0].geometry.coordinates.length; i++) {
          const coord = e.features[0].geometry.coordinates[i];
          let outputArray = [];
          for (let j = 0; j < coord.length; j++) {
            const [lon, lat] = coord[j];
            const obj = { lon, lat };
            outputArray.push(obj);
          }
          const geom = new sphere.Polygon(outputArray);
          const dots = getDots();
          count += countDot(dots, geom);
        }
        setDotCount(count);
      } else {
        setArea(turf.area(e.createdFeatures[0]));
        let count = 0;
        resetDotCount();
        for (
          let i = 0;
          i < e.createdFeatures[0].geometry.coordinates.length;
          i++
        ) {
          let outputArray = [];
          const coord = e.createdFeatures[0].geometry.coordinates[i][0];
          for (let j = 0; j < coord.length; j++) {
            const [lon, lat] = coord[j];
            const obj = { lon, lat };
            outputArray.push(obj);
          }
          const geom = new sphere.Polygon(outputArray);
          const dots = getDots();
          count += countDot(dots, geom);
        }
        setDotCount(count);
      }
    };

    const handleUpdate = (e) => {
      if (e.features[0].geometry.coordinates.length === 1) {
        setArea(turf.area(e.features[0]));
        let count = 0;
        resetDotCount();
        for (let i = 0; i < e.features[0].geometry.coordinates.length; i++) {
          let outputArray = [];
          const coord = e.features[0].geometry.coordinates[i];
          for (let j = 0; j < coord.length; j++) {
            const [lon, lat] = coord[j];
            const obj = { lon, lat };
            outputArray.push(obj);
          }
          const geom = new sphere.Polygon(outputArray);
          const dots = getDots();
          count += countDot(dots, geom);
        }
        setDotCount(count);
      } else {
        setArea(turf.area(e.features[0]));
        let count = 0;
        resetDotCount();
        for (let i = 0; i < e.features[0].geometry.coordinates.length; i++) {
          let outputArray = [];
          const coord = e.features[0].geometry.coordinates[i][0];
          for (let j = 0; j < coord.length; j++) {
            const [lon, lat] = coord[j];
            const obj = { lon, lat };
            outputArray.push(obj);
          }
          const geom = new sphere.Polygon(outputArray);
          const dots = getDots();
          count += countDot(dots, geom);
        }
        setDotCount(count);
      }
    };

    const handleDrawDelete = () => {
      setArea(0);
      setDotCount(0);
      resetDotCount();
    };

    if (map) {
      map.Renderer.on('draw.create', handleDrawCreate);
      map.Renderer.on('draw.delete', handleDrawDelete);
      map.Renderer.on('draw.combine', handleDrawCreate);
      map.Renderer.on('draw.update', handleUpdate);
    }

    return () => {
      if (map) {
        map.Renderer.off('draw.create', handleDrawCreate);
        map.Renderer.off('draw.delete', handleDrawDelete);
        map.Renderer.off('draw.combine', handleDrawCreate);
        map.Renderer.off('draw.update', handleUpdate);
      }
    };
  }, [map, setArea, setDotCount, getDots]);
  const data = {
    labels: [
      t('landUse.นาข้าว'),
      t('landUse.ข้าวโพดและไร่หมุนเวียน'),
      t('landUse.อ้อย'),
      t('landUse.เกษตรอื่น ๆ'),
      t('landUse.พื้นที่ป่า'),
      t('landUse.อื่น ๆ'),
    ],
    datasets: [
      {
        label: t('amountHotspotInLandType'),
        data: [
          riceCount,
          maizeCount,
          sugarcaneCount,
          otherCropCount,
          forestAreaCount,
          otherCount,
        ],
        backgroundColor: [
          '#fb6584',
          '#48a1e9',
          '#fbce5c',
          '#56c0c0',
          '#9c63fd',
          '#fba046',
        ],
        borderWidth: 0,
      },
    ],
  };
  return (
    <>
      {area ? (
        <div className='flex flex-col w-full space-y-2'>
          <h1 className='font-kanit text-[#212121] dark:text-white text-xl'>
            {t('area')}: {area.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
            {t('sqm')}
          </h1>
          <h1 className='font-kanit text-[#212121] dark:text-white text-xl'>
            {t('amountHotspotInLandType')}: {dotCount} {t('spot').toLowerCase()}
            {dotCount > 1 && i18n.language === 'en' ? 's' : ''}
          </h1>
          <div className='flex justify-center'>
            <div className='w-5/6'>
              {dotCount > 0 ? <Doughnut data={data} options={options} /> : ''}
            </div>
          </div>
        </div>
      ) : (
        <div className='flex flex-col justify-center space-y-4 mt-2'>
          <h1 className='font-kanit text-[#212121] dark:text-white text-2xl font-semibold text-center'>
            {t('drawAreaRequest')}
          </h1>
          <Divider className='before:border-neutral-400 before:bg-neutral-400 before:border-[1px] after:border-neutral-400 after:bg-neutral-400 after:border-[1px] text-neutral-400 font-kanit'>
            {t('or')}
          </Divider>
          <h1 className='font-kanit text-[#212121] dark:text-white text-2xl font-semibold text-center'>
            {t('selectFromBelow')}
          </h1>
          <div>
            <form className='flex flex-col space-y-4'>
              <ThemeProvider theme={selectTheme}>
                <FormControl fullWidth variant='filled' required>
                  <InputLabel id='demo-simple-select-label'>
                    {t('province')}
                  </InputLabel>
                  <Select
                    id='province'
                    value={province}
                    label={t('province')}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      setDistrict(0);
                      setSubDistrict(0);
                    }}
                    onInvalid={(e) => e.target.setCustomValidity('กรุณาเลือก')}
                  >
                    {provinceList.map((province) => (
                      <MenuItem key={province.ch_id} value={province.ch_id}>
                        {i18n.language === 'th'
                          ? province.changwat_t.replace('จ.', '')
                          : province.changwat_e}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth variant='filled'>
                  <InputLabel id='demo-simple-select-label'>
                    {t('district')}
                  </InputLabel>
                  <Select
                    id='district'
                    value={district}
                    label={t('district')}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setSubDistrict(0);
                    }}
                    disabled={province ? false : true}
                  >
                    <MenuItem key={0} value={0}>
                      {t('all')}
                    </MenuItem>
                    {apList.map((amphoe) =>
                      Number(String(amphoe.am_id).substring(0, 2)) ===
                      province ? (
                        <MenuItem key={amphoe.am_id} value={amphoe.am_id}>
                          {i18n.language === 'th'
                            ? amphoe.amphoe_t
                                .replace('อ.', '')
                                .replace('เขต', '')
                            : amphoe.amphoe_e}
                        </MenuItem>
                      ) : (
                        []
                      )
                    )}
                  </Select>
                </FormControl>
                <FormControl fullWidth variant='filled'>
                  <InputLabel id='demo-simple-select-label'>
                    {t('subDistrict')}
                  </InputLabel>
                  <Select
                    id='subDistrict'
                    value={subDistrict}
                    label={t('subDistrict')}
                    onChange={(e) => {
                      setSubDistrict(e.target.value);
                    }}
                    disabled={district ? false : true}
                  >
                    <MenuItem key={0} value={0}>
                      {t('all')}
                    </MenuItem>
                    {tbList.map((tambon) =>
                      Number(String(tambon.ta_id).substring(0, 4)) ===
                      district ? (
                        <MenuItem key={tambon.ta_id} value={tambon.ta_id}>
                          {i18n.language === 'th'
                            ? tambon.tambon_t
                                .replace('ต.', '')
                                .replace('แขวง', '')
                            : tambon.tambon_e}
                        </MenuItem>
                      ) : (
                        []
                      )
                    )}
                  </Select>
                </FormControl>
              </ThemeProvider>
              <ThemeProvider theme={buttonTheme}>
                <Button
                  variant='contained'
                  startIcon={<QueryStatsIcon />}
                  size='large'
                >
                  เริ่มวิเคราะห์
                </Button>
              </ThemeProvider>
            </form>
          </div>
        </div>
      )}
    </>
  );

  function resetDotCount() {
    riceCount =
      maizeCount =
      sugarcaneCount =
      otherCropCount =
      forestAreaCount =
      otherCount =
        0;
  }

  function countDot(dots, geom) {
    let count = 0;
    dots.forEach((dot) => {
      if (geom.contains(dot)) {
        count++;
        let data = dot._geojson.properties.data;
        if (data === 'A101') {
          riceCount++;
        } else if (data === 'A202') {
          maizeCount++;
        } else if (data === 'A203') {
          sugarcaneCount++;
        } else if (data === 'A999') {
          otherCropCount++;
        } else if (data === 'F000') {
          forestAreaCount++;
        } else if (data === 'O000') {
          otherCount++;
        }
      }
    });
    return count;
  }
}
