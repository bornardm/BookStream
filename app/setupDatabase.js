import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import * as SQLite from "expo-sqlite";

export const dbName = "bookStreamDB.db";
export let dbConnexion = null;
export const coversDir = `${FileSystem.documentDirectory}Covers/`;
const updateDB = false;

export const loadDatabase = async () => {
  const dbAsset = require("../database/bookStreamDB.db");
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
    await FileSystem.copyAsync({ from: newImageUri, to: newImageFilePath });

    //delete old image
    await deleteImageFromCovers(oldImageName);
    return newImageName;
  }

  console.log("No new image to replace");
  return null;
};

export const deleteImageFromCovers = async (imageName) => {
  if (imageName) {
    console.log("Deleting image from covers ", imageName);
    const imageFilePath = `${coversDir}${imageName}`;
    const imageInfo = await FileSystem.getInfoAsync(imageFilePath);
    if (imageInfo.exists) {
      await FileSystem.deleteAsync(imageFilePath);
      console.log("Image deleted from covers ", imageFilePath);
    }
  }
};

export const downloadImageFromInternetToCovers = async (
  imageUri,
  imageFormat
) => {
  const newImageName =
    "cover_temporary_" + new Date().getTime().toString() + "." + imageFormat;
  const newImageFilePath = `${coversDir}${newImageName}`;
  //create the directory if it doesn't exist
  await FileSystem.makeDirectoryAsync(coversDir.slice(0, -1), {
    intermediates: true,
  });
  await FileSystem.downloadAsync(imageUri, newImageFilePath);
  console.log("Image downloaded to covers ", newImageFilePath);
  return newImageFilePath;
};

//For tests
// export const updateImage = async (imageAsset, imageName) => {
//   const imageUri = Asset.fromModule(imageAsset).uri;
//   const imageFilePath = `${coversDir}${imageName}`;

//   const imageInfo = await FileSystem.getInfoAsync(imageFilePath);
//   if (!imageInfo.exists) {
//     console.log("Downloading image to cache");
//     await FileSystem.makeDirectoryAsync(coversDir.slice(0, -1), {
//       intermediates: true,
//     });
//     await FileSystem.downloadAsync(imageUri, imageFilePath);
//   }
// };

// const listAllFilesFromCovers = async () => {
//   const files = await FileSystem.readDirectoryAsync(coversDir);
//   console.log("Files in covers directory: ", files);
// };

// export const deleteAllFilesFromCovers = async () => {
//   const files = await FileSystem.readDirectoryAsync(coversDir);
//   for (const file of files) {
//     await FileSystem.deleteAsync(`${coversDir}${file}`);
//   }
// };

// export const updateAllImages = async () => {
//   console.log("Updating all images");
//   // await listAllFilesFromCovers();
//   //await deleteAllFilesFromCovers();
//   await listAllFilesFromCovers();
//   for (const cover of covers) {
//     await updateImage(cover.imageAsset, cover.imageName);
//   }
// };
