import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import th from "./locales/th.json";

const resources = {
  en: {
    translation: en,
  },
  th: {
    translation: th,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    lng: localStorage.getItem("i18nextLng") || "th",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
