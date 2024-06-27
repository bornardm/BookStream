// https://openlibrary.org/isbn/9780140328721.json
// https://openlibrary.org/api/books?bibkeys=ISBN:9780140328721&jscmd=data&format=json
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const fetchBookFromOpenLibrary = async (isbn) => {
  let jscmd = "data";
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=${jscmd}&format=json`;
  try {
    const response = await fetch(url);
    console.log("response", response);
    if (response.ok == true && response.status == 200) {
      const data = await response.json();
      console.log("data", data);
      const bookKey = `ISBN:${isbn}`;
      if (data[bookKey]) {
        const jsonBook = data[bookKey];
        console.log("jsonBook", jsonBook);
        let book = getBookFromRequestData(jsonBook);
        console.log(book);
        return book;
      } else {
        console.log("Book not found ! URL : ", response.url);
      }
    } else {
      console.log(
        "Bad request ! Reponse status : ",
        response.status,
        "(",
        response.statusText,
        ") ; Url : ",
        response.url
      );
      throw new Error("Error HTTP : " + response.status);
    }
  } catch (error) {
    console.error("Error fetching book from Open Library:", error);
  }
  return null;
};

const getBookFromRequestData = (jsonBook) => {
  let book = {};
  if (jsonBook.title) {
    book.title = jsonBook.title;
  }
  if (jsonBook.isbn_13) {
    book.isbn = jsonBook.isbn_13[0];
  }
  if (jsonBook.number_of_pages) {
    book.pageNumber = jsonBook.number_of_pages;
  }
  if (jsonBook.publish_date) {
    const parsedDate = parsePublishDate(jsonBook.publish_date);
    if (parsedDate !== null) {
      book.publicationDate = parsedDate.toISOString().split("T")[0];
    }
  }
  //summary
  //language
  //image
  //series
  //volume
  //categories
  if (jsonBook.publishers) {
    book.publisher = jsonBook.publishers[0].name;
  } //TODO if multiple publishers ???

  if (jsonBook.authors) {
    book.author = jsonBook.authors[0].name;
  } //TODO if multiple authors ???
  return book;
};

function parsePublishDate(dateStr) {
  //check for the full date format, e.g., "May 1, 1988"
  if (/^[a-zA-Z]+ \d{1,2}, \d{4}$/.test(dateStr)) {
    const dateParts = dateStr.split(/[ ,]+/); // split by comma or space
    return new Date(
      Date.UTC(
        parseInt(dateParts[2], 10),
        monthNames.indexOf(dateParts[0]),
        parseInt(dateParts[1], 10)
      )
    );
  }
  // Check for month and year format, e.g., "May 1988"
  else if (/^[a-zA-Z]+ \d{4}$/.test(dateStr)) {
    const dateParts = dateStr.split(" ");
    return new Date(
      Date.UTC(parseInt(dateParts[1], 10), monthNames.indexOf(dateParts[0]), 1)
    );
  }
  // Attempt to parse full date string directly
  else {
    let parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate)) {
      return parsedDate;
    }
  }
  // Handle unrecognized format or return a default value
  return null;
}
