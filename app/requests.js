import {
  dbName,
  dbConnexion,
  replaceImage,
  deleteImageFromCovers,
} from "./setupDatabase";
import * as SQLite from "expo-sqlite";

export function fetchBookInfos({ id }) {
  console.log("DB : start fetching book infos: id = ", id);
  let result = null;
  try {
    dbConnexion.withTransactionSync(() => {
      //console.log("transaction start ");

      result = dbConnexion.getFirstSync("SELECT * FROM BOOKS where id = ?", [
        id,
      ]);
      console.log("Row:", result);
      if (result) {
        result = modifyDefaultBookInfos(result);
      }
      //console.log("transaction end");
    });

    return result;
  } catch (e) {
    console.error("error in fetchBookInfos : ", e);
    return null;
  }
}

function modifyDefaultBookInfos(book) {
  if (book.rating === null) {
    book.rating = 0;
  }
  return book;
}

export async function fetchBookPreview({ request, params = [] }) {
  console.log(
    "DB : start fetching book preview, request = ",
    request,
    "params = ",
    params
  );
  let result = null;
  try {
    await dbConnexion.withTransactionAsync(async () => {
      //console.log("transaction start ");

      result = await dbConnexion.getAllAsync(request, params);
      //console.log("Rows:", result);
      //console.log("transaction end");
    });
    return result;
  } catch (e) {
    console.error("error in fetchBookPreview", e);
    return null;
  }
}

/**
 * Updates the database with the provided request and parameters.
 * @param {Object} options - The options object.
 * @param {string} options.request - The SQL request to be executed.
 * @param {Array} options.params - The parameters to be passed to the SQL request.
 * @returns {boolean} - Returns true if the update was successful, false otherwise.
 */
function updateDB({ request, params }) {
  let res = null;
  try {
    dbConnexion.withTransactionSync(() => {
      //console.log("transaction start ");
      //console.log("request:", request, " ; params:", params);
      res = dbConnexion.runSync(request, ...params);
      //console.log("res:", res);
      //console.log("transaction end ");
    });
    return res;
  } catch (e) {
    console.error("error in updateDB", e);
    return null;
  }
}

/**
  * Updates the rating of a book in the database.
  *
  * @param {Object} options - The options for updating the book rating.
  * @param {number} options.id - The ID of the book.
  * @param {number} options.rating - The new rating for the book.
  * @returns {boolean} - Returns true if the update was successful, false otherwise.
        
*/
export function updateBookRatingDB({ id, rating }) {
  console.log(
    "DB : start updating book rating: id = ",
    id,
    "rating = ",
    rating
  );
  return updateDB({
    request: "UPDATE BOOKS SET rating = ? WHERE id = ?",
    params: [rating, id],
  });
}

export function updateBookStatusDB({ id, status }) {
  console.log(
    "DB : start updating book status: id = ",
    id,
    "status = ",
    status
  );
  return updateDB({
    request: "UPDATE BOOKS SET status = ? WHERE id = ?",
    params: [status, id],
  });
}

export function updateBookBorrowedDB({ id, borrowed }) {
  console.log(
    "DB : start updating book borrowed: id = ",
    id,
    "borrowed = ",
    borrowed
  );
  return updateDB({
    request: "UPDATE BOOKS SET borrowed = ? WHERE id = ?",
    params: [borrowed, id],
  });
}

export function updateBookToExchangeDB({ id, toExchange }) {
  console.log(
    "DB : start updating book toExchange: id = ",
    id,
    "toExchange = ",
    toExchange
  );
  return updateDB({
    request: "UPDATE BOOKS SET toExchange = ? WHERE id = ?",
    params: [toExchange, id],
  });
}

export function updateBookStartDateDB({ id, startDate }) {
  console.log(
    "DB : start updating book startDate: id = ",
    id,
    "startDate = ",
    startDate
  );
  return updateDB({
    request: "UPDATE BOOKS SET readingStartDate = ? WHERE id = ?",
    params: [startDate, id],
  });
}

export function updateBookEndDateDB({ id, endDate }) {
  console.log(
    "DB : start updating book endDate: id = ",
    id,
    "endDate = ",
    endDate
  );
  return updateDB({
    request: "UPDATE BOOKS SET readingEndDate = ? WHERE id = ?",
    params: [endDate, id],
  });
}

export function deleteBookDB({ id, imageName }) {
  //Remove the image
  deleteImageFromCovers(imageName);

  console.log("DB :start remove book : id = ", id);
  return updateDB({
    request: "DELETE FROM BOOKS WHERE id = ?",
    params: [id],
  });
}

export async function addOrModifyBookDB({ book, newImageURI, newImageFormat }) {
  console.log("DB : start adding book ");
  let dbRequest;
  let fieldsName = [];
  let params = [];
  //Image
  try {
    const newImageName = await replaceImage(
      book.imageName.value,
      newImageURI,
      newImageFormat
    );
    if (newImageName !== null) {
      book.imageName.value = newImageName;
    }
    console.log("Image name = ", book.imageName.value);
    //fields
    for (const field in book) {
      if (field !== "id") {
        fieldsName.push(field);
        params.push(book[field].value);
      }
    }
    if (book.id.value) {
      dbRequest = `UPDATE BOOKS SET ${fieldsName
        .map((field) => `${field} = ?`)
        .join(", ")} WHERE id = ?`;
      params.push(book.id.value);
    } else {
      //addedDate
      fieldsName.push("addedDate");
      params.push(new Date().toISOString().split("T")[0]);

      dbRequest = `INSERT INTO BOOKS (${fieldsName
        .map((field) => `${field}`)
        .join(", ")}) VALUES(${params.map(() => "?").join(", ")})`;
    }
    console.log("DB  : request = ", dbRequest, "params = ", params);
    const res = updateDB({
      request: dbRequest,
      params: params,
    });
    const bookID = book.id.value ? book.id.value : res.lastInsertRowId;
    console.log("Book ID = ", res, bookID);
    return res ? bookID : false;
  } catch (error) {
    console.error("Error in editing book in db ", error);
  }
}

/**
 * Retrieves distinct values from the specified field in the BOOKS table.
 * Exclude null and empty values.
 *
 * @param {Object} options - The options for retrieving distinct values.
 * @param {string} options.field - The field to retrieve distinct values from.
 * @returns {Array|null} - An array of distinct values from the specified field, or null if an error occurs.
 */
export function getDistinctDB({ field, query = null }) {
  console.log("DB : start fetching distinct field: ", field);
  let result = null;
  try {
    dbConnexion.withTransactionSync(() => {
      //console.log("transaction start ");

      if (query) {
        result = dbConnexion.getAllSync(query);
      } else {
        result = dbConnexion.getAllSync(
          `SELECT DISTINCT ${field} FROM BOOKS WHERE ${field} IS NOT NULL AND ${field} != ""`
        );
      }
      //console.log("Rows:", result);
      //console.log("transaction end");

      //transform to array
      result = result.map((row) => row[field]);
      //console.log("Array result:", result);
    });
    return result;
  } catch (e) {
    console.error("error in getDistinctDB", e);
    return null;
  }
}

export function getDistinctYearDB({ end = true }) {
  const field = end ? "readingEndDate" : "readingStartDate";
  return getDistinctDB({
    field: "year",
    query: `SELECT DISTINCT strftime('%Y', ${field}) AS year FROM BOOKS WHERE ${field} IS NOT NULL ;`,
  });
}

export function deleteAllLibraryDB() {
  console.log("DB : start deleting all library");
  return updateDB({
    request: "DELETE FROM BOOKS",
    params: [],
  });
}
