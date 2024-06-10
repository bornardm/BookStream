import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import * as SQLite from "expo-sqlite";

export const dbName = "myBooksDB.db";
export let db = null;

export const loadDatabase = async () => {
  const dbAsset = require("../database/myBooksDB.db");
  const dbUri = Asset.fromModule(dbAsset).uri;
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

  const fileExists = await FileSystem.getInfoAsync(dbFilePath);
  if (!fileExists.exists) {
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}SQLite`,
      { intermediates: true }
    );
    await FileSystem.downloadAsync(dbUri, dbFilePath);
  }

  db = SQLite.openDatabaseSync("myBooksDB.db");
};
