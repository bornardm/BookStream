import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

const languageRessources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
};

i18next.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: "en",
  fallbackLng: "en",
  resources: languageRessources,
});

export default i18next;
