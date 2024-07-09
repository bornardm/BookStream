import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

//the key of each language must be the language name in that language.
export const languageRessources = {
  english: {
    translation: en,
  },
  français: {
    translation: fr,
  },
};

i18next.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: "english",
  fallbackLng: "english",
  resources: languageRessources,
});

export default i18next;
