import { dbName } from "./setupDatabase";
import * as SQLite from "expo-sqlite";

export function fetchData() {
  console.log("start");
  const db = SQLite.openDatabaseSync(dbName);
  console.log("db:", db);
  db.withTransactionAsync(async () => {
    console.log("transaction");

    const result = await db.getAllAsync("SELECT * FROM BOOKS");
    for (let i = 0; i < result.length; i++) {
      console.log("Row:", result[i].title);
    }
    //console.log("Count:", result);
    console.log("transaction end");
  }).catch((e) => {
    console.log("error", e);
  });
  console.log("finish");
}

export async function fetchBookInfos({ id }) {
  console.log("start fetching book infos: id = ", id);
  const db = SQLite.openDatabaseSync(dbName);
  let result = null;
  try {
    await db.withTransactionAsync(async () => {
      console.log("transaction start ");

      result = await db.getFirstAsync("SELECT * FROM BOOKS where id = ?", [id]);
      console.log("Row:", result);
      if (result) {
        result = modifyDefaultBookInfos(result);
      }
      console.log("transaction end");
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
