//The key and code of the language must be the same as the Open Library API language key
//urlKey is the code used in the OpenLibrary URL to find the language
//code is the code used in the OpenLibrary API json to find the language

import i18next from "../localization/i18n";

const languages = {
  english: {
    name: i18next.t("constants.languages.english"),
    urlKey: "eng",
    code: "en",
  },
  spanish: {
    name: i18next.t("constants.languages.spanish"),
    urlKey: "spa",
    code: "es",
  },
  french: {
    name: i18next.t("constants.languages.french"),
    urlKey: "fre",
    code: "fr",
  },
  german: {
    name: i18next.t("constants.languages.german"),
    urlKey: "ger",
    code: "de",
  },
  italian: {
    name: i18next.t("constants.languages.italian"),
    urlKey: "ita",
    code: "it",
  },
};

export const currentLanguage = languages.english;
