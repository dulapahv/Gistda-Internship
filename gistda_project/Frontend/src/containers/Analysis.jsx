import React, { useEffect } from 'react';

import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js';

import * as turf from '@turf/turf';

import { getDots } from '.';
import { map, sphere } from '../components';

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
  const [area, setArea] = React.useState(0);
  const [dotCount, setDotCount] = React.useState(0);

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
        <div className='flex justify-center'>
          <h1 className='font-kanit text-[#212121] dark:text-white text-2xl font-semibold'>
            {t('drawAreaRequest')}
          </h1>
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
