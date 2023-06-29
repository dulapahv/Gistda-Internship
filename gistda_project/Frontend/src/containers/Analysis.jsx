import React, { useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import * as turf from '@turf/turf';

import { getDots } from '.';
import { map, sphere } from '../components';

let riceCount = 0;
let maizeCount = 0;
let sugarcaneCount = 0;
let otherCropCount = 0;
let forestAreaCount = 0;
let otherCount = 0;
export default function Analysis() {
  const { t, i18n } = useTranslation();
  const [area, setArea] = React.useState(0);
  const [dotCount, setDotCount] = React.useState(0);

  useEffect(() => {
    const handleDrawCreate = (e) => {
      if (e.features && e.features[0].geometry.coordinates.length === 1) {
        setArea(turf.area(e.features[0]));
        let count = 0;
        riceCount = 0;
        maizeCount = 0;
        sugarcaneCount = 0;
        otherCropCount = 0;
        forestAreaCount = 0;
        otherCount = 0;
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
        }
        setDotCount(count);
      } else {
        setArea(turf.area(e.createdFeatures[0]));
        let count = 0;
        riceCount = 0;
        maizeCount = 0;
        sugarcaneCount = 0;
        otherCropCount = 0;
        forestAreaCount = 0;
        otherCount = 0;
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
        }
        setDotCount(count);
      }
    };

    const handleDrawDelete = () => {
      setArea(0);
      setDotCount(0);
      riceCount = 0;
      maizeCount = 0;
      sugarcaneCount = 0;
      otherCropCount = 0;
      forestAreaCount = 0;
      otherCount = 0;
    };

    const handleUpdate = (e) => {
      if (e.features[0].geometry.coordinates.length === 1) {
        setArea(turf.area(e.features[0]));
        let count = 0;
        riceCount = 0;
        maizeCount = 0;
        sugarcaneCount = 0;
        otherCropCount = 0;
        forestAreaCount = 0;
        otherCount = 0;
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
        }
        setDotCount(count);
      } else {
        setArea(turf.area(e.features[0]));
        let count = 0;
        riceCount = 0;
        maizeCount = 0;
        sugarcaneCount = 0;
        otherCropCount = 0;
        forestAreaCount = 0;
        otherCount = 0;
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
        }
        setDotCount(count);
      }
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

  return (
    <div className='flex flex-col space-y-4'>
      <div className='flex flex-row'>
        {area ? (
          <div className='flex flex-col'>
            <h1 className='font-kanit text-[#212121] dark:text-white text-xl'>
              พื้นที่: {area.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
              ตร.ม.
            </h1>
            <h1 className='font-kanit text-[#212121] dark:text-white text-xl'>
              จำนวนจุดความร้อนที่อยู่ในพื้นที่: {dotCount} จุด
            </h1>
            <h1 className='font-kanit text-[#212121] dark:text-white text-xl'>
              ประเภทของพื้นที่ที่เกิดจุดความร้อนในพื้นที่:
              <br />
              rice: {riceCount}
              <br />
              maize: {maizeCount}
              <br />
              sugarcane: {sugarcaneCount}
              <br />
              otherCrop: {otherCropCount}
              <br />
              forestArea: {forestAreaCount}
              <br />
              other: {otherCount}
            </h1>
          </div>
        ) : (
          <h1 className='font-kanit text-[#212121] dark:text-white text-xl'>
            กรุณาวาดแผนที่เพื่อวิเคราะห์ข้อมูล
          </h1>
        )}
      </div>
    </div>
  );
}
