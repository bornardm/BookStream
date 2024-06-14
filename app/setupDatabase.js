import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import * as SQLite from "expo-sqlite";

export const dbName = "myBooksDB.db";
export const coversDir = `${FileSystem.documentDirectory}Covers/`;
const updateDB = false;

export const loadDatabase = async () => {
  const dbAsset = require("../database/myBooksDB.db");
  const dbUri = Asset.fromModule(dbAsset).uri;
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

  const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
  if (!fileInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}SQLite`,
      { intermediates: true }
    );
    await FileSystem.downloadAsync(dbUri, dbFilePath);
  }
  if (updateDB) {
    //await FileSystem.deleteAsync(dbFilePath);
    console.log("DB Updating...");
    await FileSystem.downloadAsync(dbUri, dbFilePath);
  }
};

//For tests
const covers = [
  {
    imageName: "Lemon-M.jpg",
    imageAsset: require("../assetForTest/Lemon-M.jpg"),
  },
  {
    imageName: "Pandemie-M.jpg",
    imageAsset: require("../assetForTest/Pandemie-M.jpg"),
  },
  {
    imageName: "poter_cover-M.jpg",
    imageAsset: require("../assetForTest/poter_cover-M.jpg"),
  },
  {
    imageName: "rider-M.jpg",
    imageAsset: require("../assetForTest/rider-M.jpg"),
  },
  {
    imageName: "rider2-M.jpg",
    imageAsset: require("../assetForTest/rider2-M.jpg"),
  },
];

export const updateImage = async (imageAsset, imageName) => {
  const imageUri = Asset.fromModule(imageAsset).uri;
  const imageFilePath = `${coversDir}${imageName}`;

  const imageInfo = await FileSystem.getInfoAsync(imageFilePath);
  if (!imageInfo.exists) {
    console.log("Downloading image to cache");
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}Covers`,
      { intermediates: true }
    );
    await FileSystem.downloadAsync(imageUri, imageFilePath);
  }
};

export const updateAllImages = async () => {
  for (const cover of covers) {
    await updateImage(cover.imageAsset, cover.imageName);
  }
};
