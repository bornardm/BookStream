import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import * as SQLite from "expo-sqlite";

export const dbName = "bookStreamDB.db";
export let dbConnexion = null;
export const coversDir = `${FileSystem.documentDirectory}Covers/`;
const dbDir = `${FileSystem.documentDirectory}SQLite/`;
const dbFilePath = `${dbDir}${dbName}`;
const importedDbDir = `${FileSystem.documentDirectory}ImportedDataBases/`;
const importedDbName = "ImportedDB.db";
const importedDbFilePath = `${importedDbDir}${importedDbName}`;
const updateDB = false;

export const loadDatabase = async () => {
    const dbAsset = require("../database/bookStreamDB.db");
    const dbUri = Asset.fromModule(dbAsset).uri;

    const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
    if (!fileInfo.exists) {
        await FileSystem.makeDirectoryAsync(`${dbDir}`, {
            intermediates: true,
        });
        await FileSystem.downloadAsync(dbUri, dbFilePath);
    }
    if (updateDB) {
        //await FileSystem.deleteAsync(dbFilePath);
        console.log("DB Updating...");
        await FileSystem.downloadAsync(dbUri, dbFilePath);
    }
    //open the connexion to db
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
        "cover_temporary_" +
        new Date().getTime().toString() +
        "." +
        imageFormat;
    const newImageFilePath = `${coversDir}${newImageName}`;
    //create the directory if it doesn't exist
    await FileSystem.makeDirectoryAsync(coversDir.slice(0, -1), {
        intermediates: true,
    });
    await FileSystem.downloadAsync(imageUri, newImageFilePath);
    console.log("Image downloaded to covers ", newImageFilePath);
    return newImageFilePath;
};

//for connection to a new DB (when importing a db)

/**
 * @description Copies a file to the sandbox directory
 *
 * @param {string} srcPath - The source path of the file to copy.
 * @param {string} dstPath - The destination path in the sandbox directory.
 * @returns {Promise<void>} - A promise that resolves when the file is copied.
 * @throws {Error} - If the file copy operation fails.
 */
const copyFileToSandbox = async (srcPath, dstPath) => {
    console.log("Copying file from ", srcPath, "to", dstPath);

    try {
        await FileSystem.copyAsync({
            from: srcPath,
            to: dstPath,
        });
        console.log("File copied to sandbox:", dstPath);
    } catch (error) {
        console.error("Error copying file:", error);
    }
};

/**
 * @description Opens a SQLite database connection to the specified URI.
 *
 * @param {string} dbUri - The URI of the database file.
 */
export const getDBconnexion = async (dbUri) => {
    await copyFileToSandbox(dbUri, importedDbFilePath);

    //open the connexion
    console.log("Opening database connection to ", importedDbFilePath);
    const fileInfo = await FileSystem.getInfoAsync(importedDbFilePath);
    if (!fileInfo.exists) {
        console.log(`DB ${importedDbFilePath}doesn't exist`);
        throw new Error("Database not found");
    }
    //open the connexion to db
    const connexion = await SQLite.openDatabaseAsync(
        importedDbName,
        {},
        importedDbDir
    );
    return connexion;
};

/**
 * Copy the database located in the importedDbDir to the SQLite directory
 * Delete the database in the importedDbDir
 */
export const replaceDB = async () => {
    console.log("Replacing database");
    try{
      const fileInfo = await FileSystem.getInfoAsync(importedDbFilePath);
      if (fileInfo.exists) {
        await FileSystem.copyAsync({
          from: importedDbFilePath,
          to: dbFilePath,
        });
        //delete the imported database
        await FileSystem.deleteAsync(importedPath);
        console.log("Database replaced");
      }
      throw new Error("Database not found");
    }catch(e){
      throw new Error("Error replacing database: " + e);
    }

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
