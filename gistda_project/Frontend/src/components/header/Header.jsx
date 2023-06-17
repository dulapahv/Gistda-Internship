import React from "react";

import { useTranslation } from "react-i18next";

function Header({ text }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row place-content-center h-auto flex-wrap py-10">
      <h1 className="font-kanit text-neutral-900 text-center text-2xl">
        {t(text)}
      </h1>
    </div>
  );
}

export default Header;
