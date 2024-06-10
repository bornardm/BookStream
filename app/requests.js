import { db } from "./setupDatabase";
import * as SQLite from "expo-sqlite";

export function fetchData() {
  console.log("start");
  db.withTransactionAsync(async () => {
    console.log("transaction");
    const result = await db.getAllAsync("SELECT * FROM user");
    console.log("Count:", result);
    console.log("transaction end");
  }).catch((e) => {
    console.log("error", e);
  });
  console.log("finish");
}
