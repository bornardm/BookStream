import { dbName, dbConnexion } from "./setupDatabase";
import * as SQLite from "expo-sqlite";
import { setDefaultBookStatus } from "./constants/BookStatus";
import { setSelectedSortItem } from "./screens/HomeScreen";
import i18next, { deviceLanguageDetector } from "./localization/i18n";

export function fetchSettings() {
  console.log("DB : start fetching settings");
  let result = null;
  try {
    dbConnexion.withTransactionSync(() => {
      //console.log("transaction start ");

      settings = dbConnexion.getFirstSync(
        "SELECT * FROM SETTINGS where id = 0"
      );
      console.log("Row:", settings);
      if (settings) {
        if (settings.defaulfBookStatus != null) {
          setDefaultBookStatus(settings.defaulfBookStatus);
        }
        if (settings.language != null) {
          i18next.changeLanguage(settings.language);
        } else {
          //set the language to the default language from the device
          deviceLanguageDetector();
        }
        if (settings.sort != null) {
          setSelectedSortItem(settings.sort);
        } else {
          setSelectedSortItem("addedDate");
        }
      }
      //console.log("transaction end");
    });

    return result;
  } catch (e) {
    console.error("error in fetchSettings : ", e);
    return null;
  }
}
