import React from 'react';

import { useTranslation } from 'react-i18next';

export default function Header({ text }) {
  const { t } = useTranslation();

  return (
    <div className='flex flex-row place-content-center h-auto flex-wrap py-8'>
      <h1 className='font-kanit text-neutral-900 dark:text-white text-center text-3xl capitalize'>
        {t(text)}
      </h1>
    </div>
  );
}
