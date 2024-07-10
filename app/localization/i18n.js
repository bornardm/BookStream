import i18next from "i18next";
import { initReactI18next } from "react-i18next";
//import * as RNLocalize from "react-native-localize";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

//the key of each language must be the language name in that language.
export const languageResources = {
  english: {
    translation: en,
  },
  français: {
    translation: fr,
  },
};
// // Find the best available language from the device
// const bestAvailableLanguage = RNLocalize.findBestAvailableLanguage(
//   Object.keys(languageResources)
// );

// const initialLanguage = bestAvailableLanguage
//   ? bestAvailableLanguage.languageTag
//   : "english";

i18next.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: "english",
  fallbackLng: "english",
  resources: languageResources,
});

export default i18next;
