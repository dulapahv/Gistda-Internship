import React from 'react';

import { useTranslation } from 'react-i18next';

export default function DetailAgri() {
  const { t, i18n } = useTranslation();

  return (
    <div className='flex flex-col space-y-4'>
      <div className='grid gap-4 sm:grid-cols-1 md:grid-cols-2'>
        <h1 className='font-kanit text-[#212121] dark:text-white text-xl'>
          กรุณาวาดแผนที่เพื่อวิเคราะห์ข้อมูล
        </h1>
      </div>
    </div>
  );
}
