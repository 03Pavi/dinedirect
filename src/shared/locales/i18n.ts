
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import spanishLang from "./es-es.json";
import englishLang from "./en-us.json";

export const normalizeLng = (lng: string) => {
  switch (lng) {
    case "en-US":
    case "en_US":
      return "en-us";
    case "es-ES":
    case "es_ES":
      return "es-es";
    default:
      return "en-us";
  }
};

// List of supported languages
export const availableLanguages = [
  { lang: "en-us", name: "English (EE.UU.)" },
  { lang: "es-es", name: "Español (España)" },
];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "en-us": { translation: englishLang },
      "es-es": { translation: spanishLang },
    },
    fallbackLng: "en-us",
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
    lng: typeof window !== "undefined" ? normalizeLng(localStorage.getItem("i18nextLng") || navigator.language) : "en-us",
  });
