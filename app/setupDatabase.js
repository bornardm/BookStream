import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import * as SQLite from "expo-sqlite";

export const dbName = "myBooksDB.db";
export let dbConnexion = null;
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
  //open the connexio to db
  dbConnexion = await SQLite.openDatabaseAsync(dbName);
};

export const replaceImage = async (
  oldImageName,
  newImageUri,
  newImageFormat
) => {
  console.log("Image replacement", oldImageName, newImageUri, newImageFormat);
  if (newImageUri) {
    //delete old image
    if (oldImageName) {
      const oldImageFilePath = `${coversDir}${oldImageName}`;
      const oldImageInfo = await FileSystem.getInfoAsync(oldImageFilePath);
      if (oldImageInfo.exists) {
        await FileSystem.deleteAsync(oldImageFilePath);
      }
    }
    //download new image
    if (
      !newImageFormat ||
      (newImageFormat !== "jpg" &&
        newImageFormat !== "png" &&
        newImageFormat !== "jpeg")
    ) {
      newImageFormat = "jpeg";
    }
    const newImageName =
      "cover_" + new Date().getTime().toString() + "." + newImageFormat;
    const newImageFilePath = `${coversDir}${newImageName}`;

    //create the directory if it doesn't exist
    await FileSystem.makeDirectoryAsync(coversDir.slice(0, -1), {
      intermediates: true,
    });
    await FileSystem.downloadAsync(newImageUri, newImageFilePath);
    return newImageName;
  }
  console.log("No new image to replace");
  return null;
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
    await FileSystem.makeDirectoryAsync(coversDir.slice(0, -1), {
      intermediates: true,
    });
    await FileSystem.downloadAsync(imageUri, imageFilePath);
  }
};

export const updateAllImages = async () => {
  console.log("Updating all images");
  for (const cover of covers) {
    await updateImage(cover.imageAsset, cover.imageName);
  }
};
