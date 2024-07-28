import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";

//the key of each language must be the language name in that language.
export const languageResources = {
  english: {
    translation: en,
  },
  français: {
    translation: fr,
  },
  deutsch: {
    translation: de,
  },
};
//without region code
const languageCodes = {
  en: "english",
  fr: "français",
  de: "deutsch",
};

/**
 * Detects the device language and changes the language of the app accordingly.
 */
export const deviceLanguageDetector = () => {
  const deviceLanguage = Localization.getLocales()[0].languageCode;
  if (deviceLanguage && languageCodes[deviceLanguage]) {
    console.log("Detected device language : ", languageCodes[deviceLanguage]);
    i18next.changeLanguage(languageCodes[deviceLanguage]);
  }
};

i18next.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: "english",
  fallbackLng: "english",
  resources: languageResources,
});

export default i18next;
