//The key and code of the language must be the same as the Open Library API language key
//urlKey is the code used in the OpenLibrary URL to find the language
//code is the code used in the OpenLibrary API json to find the language

const languages = {
  english: { name: "English", urlKey: "eng", code: "en" },
  spanish: { name: "Spanish", urlKey: "spa", code: "es" },
  french: { name: "French", urlKey: "fre", code: "fr" },
  german: { name: "German", urlKey: "ger", code: "de" },
};

export const currentLanguage = languages.english;
