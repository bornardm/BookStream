//import { currentLanguage } from "./constants/languages";

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
  // Function to process response
  const processResponse = async (response, requestType) => {
    console.log(`@${requestType}-- Response : `, response);
    if (response.ok == true && response.status == 200) {
      const data = await response.json();
      console.log(`@${requestType}-- Data`, data);
      const bookKey = `ISBN:${isbn}`;
      if (data[bookKey]) {
        const jsonBook = data[bookKey];
        console.log(`@${requestType}-- jsonBook`, jsonBook);
        let book = {};
        if (requestType === "data") {
          book = getBookFromRequestData(jsonBook);
        } else if (requestType === "details") {
          book = getBookFromRequestDetails(jsonBook);
        }
        console.log(`@${requestType}--`, book);
        return book;
      } else {
        console.log(`@${requestType}-- Book not found ! URL : `, response.url);
        return null;
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
  };

  const baseUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json`;

  // Define URLs for both requests
  const dataUrl = `${baseUrl}&jscmd=data`;
  const detailsUrl = `${baseUrl}&jscmd=details`;

  try {
    // Send both requests and process responses simultaneously
    const [dataResponse, detailsResponse] = await Promise.all([
      fetch(dataUrl).then((response) => processResponse(response, "data")),
      fetch(detailsUrl).then((response) =>
        processResponse(response, "details")
      ),
    ]);

    // At this point, dataResponse and detailsResponse are processed results
    const combinedResultBook = {
      ...(dataResponse ? dataResponse : {}),
      ...(detailsResponse ? detailsResponse : {}),
    };

    //TODO translate language

    console.log("Combined result book : ", combinedResultBook);
    return combinedResultBook;
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
  if (jsonBook.identifiers?.isbn_13) {
    book.isbn = jsonBook.identifiers.isbn_13[0];
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
  // TODO categories
  if (jsonBook.publishers) {
    book.publisher = jsonBook.publishers[0].name;
  } //TODO if multiple publishers ???

  if (jsonBook.authors) {
    book.author = jsonBook.authors[0].name;
  } //TODO if multiple authors ???

  //cover
  if (jsonBook.cover) {
    const coverUrl =
      jsonBook.cover.medium || jsonBook.cover.small || jsonBook.cover.large;
    if (coverUrl) {
      book.imageInternetURL = coverUrl; //Be carreful : it's imageInternetURL and not imageName !
    }
  }
  return book;
};
const getBookFromRequestDetails = (jsonBook) => {
  let book = {};
  if (jsonBook.details) {
    if (jsonBook.details.description) {
      book.summary = jsonBook.details.description.value;
    }
    if (jsonBook.details.languages) {
      book.language = jsonBook.details.languages[0].key;
    }
    if (jsonBook.details.series) {
      book.series = jsonBook.details.series[0];
    }
  }
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
