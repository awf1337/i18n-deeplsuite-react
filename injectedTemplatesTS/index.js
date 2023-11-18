import { initReactI18next } from "react-i18next"
import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import resources from "./resources"

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  // https://www.i18next.com/overview/configuration-options
  .init({
    resources,
    fallbackLng: ["en"],
    returnNull: false,
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    load: "all",
    // https://github.com/i18next/i18next-browser-languageDetector#detector-options
    detection: {
      convertDetectedLanguage: (lng) => lng.split("-")[0],
    },
  })
  .catch(() => true)

export default i18n
