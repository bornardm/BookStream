import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import {
  dbName,
  dbConnexion,
  replaceImage,
  deleteImageFromCovers,
} from "./setupDatabase";
import * as SQLite from "expo-sqlite";
import { BOOK_STATUS } from "./constants/BookStatus";

export function fetchBookInfos({ id }) {
  console.log("DB : start fetching book infos: id = ", id);
  let result = null;
  try {
    dbConnexion.withTransactionSync(() => {
      //console.log("transaction start ");

      result = dbConnexion.getFirstSync("SELECT * FROM BOOKS where id = ?", [
        id,
      ]);
      //console.log("Row:", result);
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
  // console.log(
  //   "DB : start fetching book preview, request = ",
  //   request,
  //   "params = ",
  //   params
  // );
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
export function updateDB({ request, params }) {
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
  // console.log(
  //   "DB : start updating book rating: id = ",
  //   id,
  //   "rating = ",
  //   rating
  // );
  return updateDB({
    request: "UPDATE BOOKS SET rating = ? WHERE id = ?",
    params: [rating, id],
  });
}

export function updateBookStatusDB({ id, status }) {
  // console.log(
  //   "DB : start updating book status: id = ",
  //   id,
  //   "status = ",
  //   status
  // );
  return updateDB({
    request: "UPDATE BOOKS SET status = ? WHERE id = ?",
    params: [status, id],
  });
}

export function updateBookCommentDB({ id, comment }) {
  // console.log(
  //   "DB : start updating book comment: id = ",
  //   id,
  //   "comment = ",
  //   comment
  // );
  return updateDB({
    request: "UPDATE BOOKS SET comment = ? WHERE id = ?",
    params: [comment, id],
  });
}

export function updateBookBorrowedDB({ id, borrowed }) {
  // console.log(
  //   "DB : start updating book borrowed: id = ",
  //   id,
  //   "borrowed = ",
  //   borrowed
  // );
  return updateDB({
    request: "UPDATE BOOKS SET borrowed = ? WHERE id = ?",
    params: [borrowed, id],
  });
}

export function updateBookToExchangeDB({ id, toExchange }) {
  // console.log(
  //   "DB : start updating book toExchange: id = ",
  //   id,
  //   "toExchange = ",
  //   toExchange
  // );
  return updateDB({
    request: "UPDATE BOOKS SET toExchange = ? WHERE id = ?",
    params: [toExchange, id],
  });
}

export function updateBookStartDateDB({ id, startDate }) {
  // console.log(
  //   "DB : start updating book startDate: id = ",
  //   id,
  //   "startDate = ",
  //   startDate
  // );
  return updateDB({
    request: "UPDATE BOOKS SET readingStartDate = ? WHERE id = ?",
    params: [startDate, id],
  });
}

export function updateBookEndDateDB({ id, endDate }) {
  // console.log(
  //   "DB : start updating book endDate: id = ",
  //   id,
  //   "endDate = ",
  //   endDate
  // );
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
    //console.log("Image name = ", book.imageName.value);
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
    const res = updateDB({
      request: dbRequest,
      params: params,
    });
    const bookID = book.id.value ? book.id.value : res.lastInsertRowId;
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
  let result = null;
  try {
    dbConnexion.withTransactionSync(() => {
      //console.log("transaction start ");

      if (query) {
        result = dbConnexion.getAllSync(query);
      } else {
        result = dbConnexion.getAllSync(
          `SELECT DISTINCT ${field} FROM BOOKS WHERE ${field} IS NOT NULL AND ${field} != "" ORDER BY ${field} ASC`
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
    query: `SELECT DISTINCT strftime('%Y', ${field}) AS year FROM BOOKS WHERE ${field} IS NOT NULL ORDER BY year DESC ;`,
  });
}

export function deleteAllLibraryDB() {
  console.log("DB : start deleting all library");
  return updateDB({
    request: "DELETE FROM BOOKS",
    params: [],
  });
}

//settings :
export function updateSettingDB({ field, value }) {
  console.log("DB : start updating Setting ", field, " : value = ", value);
  return updateDB({
    request: `UPDATE SETTINGS SET ${field} = ? WHERE id = 0`,
    params: [value],
  });
}

//Statistics

/**
 * Executes a synchronous database query and returns the result.
 *
 * @param {Object} options - The options for the query.
 * @param {string} options.request - The SQL query to execute.
 * @param {Array} [options.params=[]] - The parameters for the query.
 * @returns {Array|null} - The result of the query, or null if an error occurred.
 */
function getExecSyncDB({ request, params = [] }) {
  //console.log("DB : start fetching execSync");
  let result = null;
  try {
    dbConnexion.withTransactionSync(() => {
      //console.log("transaction start ");
      //console.log("request:", request, " ; params:", params);
      result = dbConnexion.getAllSync(request, params);
      //console.log("Rows:", result);
      //console.log("transaction end");
    });
    return result;
  } catch (e) {
    console.error("error in getExecSyncDB", e);
    return null;
  }
}

/**
 * Retrieves the status statistics from the database.
 * @returns {Promise<Array<{status: string, count: number}>>} The status statistics.
 */
export function getStatsStatusDB() {
  //console.log("DB : start fetching status stats");
  const request = "SELECT status, COUNT(*) as count FROM BOOKS GROUP BY status";
  return getExecSyncDB({ request });
}

/**
 * Retrieves the statistics of the top 10 authors from the database.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of objects containing author and count properties.
 */
export function getStats10AuthorsDB() {
  //console.log("DB : start fetching authors stats");
  const request =
    "SELECT author, COUNT(*) as count FROM BOOKS GROUP BY author ORDER BY count DESC LIMIT 10";
  return getExecSyncDB({ request });
}

/**
 * Retrieves the number of books from the database based on the provided parameters.
 *
 * @param {Object} options - The options for retrieving the numbers from the database.
 * @param {string} options.countString - The count string to be used in the SELECT statement.
 * @param {number|null} options.year - The year to filter the results by. If null, no year filter will be applied.
 * @returns {number|null} The number of books matching the provided parameters, or null if no result is found.
 */
function getNumbersDB({ countString, year = null }) {
  let yearCondition = "";
  let params = [BOOK_STATUS.READ];

  if (year !== null) {
    yearCondition = `AND strftime('%Y', readingEndDate) = ?`;
    params.push(year.toString());
  }

  //console.log("DB : start fetching numbers ", countString);
  const request = `SELECT ${countString} as number FROM BOOKS WHERE status = ? ${yearCondition}`;
  const result = getExecSyncDB({ request, params });

  if (result) {
    return result[0].number;
  }
  return null;
}
/**
 * Retrieves the number of pages read from the database.
 * @param {Object} options - The options for retrieving the number of pages read.
 * @param {number} options.year - The year for which to retrieve the number of pages read.
 * @returns {Promise<number>} - A promise that resolves to the number of pages read.
 */
export function getNumberPagesReadDB({ year = null }) {
  return getNumbersDB({ countString: "SUM(pageNumber)", year: year });
}

/**
 * Retrieves the number of books read from the database.
 * @param {Object} options - The options for retrieving the number of books read.
 * @param {number} options.year - The year for which to retrieve the number of books read.
 * @returns {Promise<number>} - A promise that resolves to the number of books read.
 */
export function getNumberBooksReadDB({ year = null }) {
  return getNumbersDB({ countString: "COUNT(*)", year: year });
}

/**
 * Retrieves the number of books read by month from the database.
 *
 * @param {Object} options - The options for retrieving the number of books read by month.
 * @param {number} options.year - The year for which to retrieve the data.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of objects containing the month and count of books read.
 */
export function getNumberBooksReadByMonthDB({ year }) {
  //console.log("DB : start fetching number books read by month");
  const request = `SELECT strftime('%m', readingEndDate) as month, COUNT(*) as count FROM BOOKS WHERE status = ? AND month IS NOT NULL AND strftime('%Y', readingEndDate) = ? GROUP BY month ORDER BY month ASC`;
  return getExecSyncDB({
    request,
    params: [BOOK_STATUS.READ, year.toString()],
  });
}

/**
 * Retrieves the number of books read by year from the database.
 * @returns {Array} An array of objects containing the year and the count of books read for each year.
 */
export function getNumberBooksReadByYearDB() {
  //console.log("DB : start fetching number books read by year");
  const request = `SELECT strftime('%Y', readingEndDate) as year, COUNT(*) as count FROM BOOKS WHERE status = ? AND year IS NOT NULL GROUP BY year ORDER BY year ASC`;
  return getExecSyncDB({ request, params: [BOOK_STATUS.READ] });
}

/**
 * Retrieves the average number of days it takes to read a book from the database.
 * @param {Object} options - The options for filtering the results.
 * @param {number} options.year - The year to filter the results by. If not provided, all years will be considered.
 * @returns {number|null} - The average number of days to read a book, rounded to the nearest whole number. Returns null if no result is found.
 */
export function getAverageNumberOfDaystoReadDB({ year = null }) {
  //console.log("DB : start fetching average number of days to read");
  let yearCondition = "";
  let params = [BOOK_STATUS.READ];

  if (year !== null) {
    yearCondition = `AND strftime('%Y', readingEndDate) = ?`;
    params.push(year.toString());
  }
  const request = `SELECT AVG(julianday(readingEndDate) - julianday(readingStartDate)) as avgDays FROM BOOKS WHERE status = ? AND readingStartDate IS NOT NULL AND readingEndDate IS NOT NULL ${yearCondition}`;
  const result = getExecSyncDB({ request, params: params });
  if (result) {
    return Math.round(result[0].avgDays);
  }
  return null;
}

/**
 * Retrieves the top rated books from the database.
 * @param {Object} options - The options for retrieving the top rated books.
 * @param {number} [options.year=null] - The year to filter the books by. If not provided, all years will be considered.
 * @param {number} [options.limit=5] - The maximum number of books to retrieve.
 * @returns {Array<Object>|null} - An array of book objects representing the top rated books, or null if no books are found.
 */
export function getTopRatedBooksDB({ year = null, limit = 5 }) {
  //console.log("DB : start fetching top rated books");
  let yearCondition = "";
  let params = [];

  if (year !== null) {
    yearCondition = ` AND strftime('%Y', readingEndDate) = ?`;
    params.push(year.toString());
  }

  const requestMaxRating = `Select MAX(rating) as maxRating from BOOKS  WHERE 1=1 ${yearCondition}`;
  const maxRating = getExecSyncDB({ request: requestMaxRating, params });
  if (maxRating) {
    const request = `SELECT id as bookId, title, author, rating, status, imagename FROM BOOKS WHERE 1=1 ${yearCondition} AND rating = ?  LIMIT ?`;
    params.push(maxRating[0].maxRating);
    params.push(limit);
    return getExecSyncDB({ request, params: params });
  }
  return null;
}
