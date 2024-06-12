import { dbName } from "./setupDatabase";
import * as SQLite from "expo-sqlite";

export async function fetchBookInfos({ id }) {
  console.log("DB : start fetching book infos: id = ", id);
  const db = SQLite.openDatabaseSync(dbName);
  let result = null;
  try {
    await db.withTransactionAsync(async () => {
      //console.log("transaction start ");

      result = await db.getFirstAsync("SELECT * FROM BOOKS where id = ?", [id]);
      console.log("Row:", result);
      if (result) {
        result = modifyDefaultBookInfos(result);
      }
      //console.log("transaction end");
    });
    return result;
  } catch (e) {
    console.error("error", e);
    return null;
  }
}

function modifyDefaultBookInfos(book) {
  if (book.rating === null) {
    book.rating = 0;
  }
  return book;
}

export async function fetchBookPreview() {
  console.log("DB : start fetching all book preview");
  const db = SQLite.openDatabaseSync(dbName);
  let result = null;
  try {
    await db.withTransactionAsync(async () => {
      //console.log("transaction start ");

      result = await db.getAllAsync(
        "SELECT id, title, author, rating, status, imagePath FROM BOOKS"
      );
      //console.log("Rows:", result);
      //console.log("transaction end");
    });
    return result;
  } catch (e) {
    console.error("error", e);
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
  const db = SQLite.openDatabaseSync(dbName);
  try {
    db.withTransactionAsync(async () => {
      //console.log("transaction start ");
      //console.log("request:", request, " ; params:", params);
      const res = await db.runAsync(request, ...params);
      //console.log("res:", res);
      //console.log("transaction end ");
    });
    return true;
  } catch (e) {
    console.error("error", e);
    return false;
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

export function deleteBookDB({ id }) {
  console.log("DB :start remove book : id = ", id);
  return updateDB({
    request: "DELETE FROM BOOKS WHERE id = ?",
    params: [id],
  });
}
