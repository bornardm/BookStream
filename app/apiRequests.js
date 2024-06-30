import { currentLanguage } from "./constants/languages";
import { APP_NAME, APP_VERSION } from "./constants/general";
import { contactEmail } from "./confidential";

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

const headers = new Headers({
  "User-Agent": `${APP_NAME}/${APP_VERSION} (${contactEmail})`,
});
console.log("Headers : ", headers);
const options = {
  method: "GET",
  headers: headers,
};

export const fetchBookFromOpenLibrary = async (isbn) => {
  /**
   * Processes the response received from an API request.
   *
   * @param {Response} response - The response object received from the API request.
   * @param {string} requestType - The type of the API request (e.g., "data" or "details" or "work").
   * @returns {Promise<Object|null>} - A promise that resolves to the processed book object if found, or null if not found.
   * @throws {Error} - Throws an error if the API request fails.
   */
  const processResponse = async (response, requestType) => {
    console.log(`@${requestType}-- Response : `, response);
    if (response.ok == true && response.status == 200) {
      let book = {};
      const data = await response.json();
      if (requestType === "work") {
        const book = getBookFromRequestWork(data);
        console.log(`@${requestType}--`, book);
        return book;
      } else {
        //console.log(`@${requestType}-- Data`, data);
        const bookKey = `ISBN:${isbn}`;
        if (data[bookKey]) {
          const jsonBook = data[bookKey];
          console.log(`@${requestType}-- jsonBook`, jsonBook);
          if (requestType === "data") {
            book = getBookFromRequestData(jsonBook);
          } else if (requestType === "details") {
            book = getBookFromRequestDetails(jsonBook);
          }
          console.log(`@${requestType}--`, book);
          return book;
        } else {
          console.log(
            `@${requestType}-- Book not found ! URL : `,
            response.url
          );
          return null;
        }
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
      fetch(dataUrl, options).then((response) =>
        processResponse(response, "data")
      ),
      fetch(detailsUrl, options).then((response) =>
        processResponse(response, "details")
      ),
    ]);

    // At this point, dataResponse and detailsResponse are processed results
    let combinedResultBook = {
      ...(dataResponse ? dataResponse : {}),
      ...(detailsResponse ? detailsResponse : {}),
    };
    console.log("Combined result book : ", combinedResultBook);

    //get summary if it's null :
    if (combinedResultBook.hasOwnProperty("work")) {
      if (!combinedResultBook.summary) {
        console.log("fetching work summary...");
        const workUrl = `https://openlibrary.org${combinedResultBook.work}.json`;
        let workResponse = await fetch(workUrl, options);
        workResponse = await processResponse(workResponse, "work");
        combinedResultBook = {
          ...combinedResultBook,
          ...(workResponse ? workResponse : {}),
        };
      }
    }

    //Translate language
    if (combinedResultBook.language) {
      combinedResultBook.language = await getBookTranslatedLanguage(
        combinedResultBook.language
      );
    }

    console.log("Combined result book : ", combinedResultBook);
    //return the book if it'snot empty
    if (Object.keys(combinedResultBook).length > 0) {
      return combinedResultBook;
    }
    return null;
  } catch (error) {
    console.error("Error fetching book from Open Library:", error);
  }
  return null;
};

/**
 * Extracts relevant book information from the provided JSON book object resulting from a "data" request.
 *
 * @param {Object} jsonBook - The JSON book object containing book details.
 * @returns {Object} - The extracted book information.
 */
const getBookFromRequestData = (jsonBook) => {
  let book = {};
  if (jsonBook.title) {
    let title = jsonBook.title;
    if (jsonBook.subtitle) {
      title += `: ${jsonBook.subtitle}`;
    }
    book.title = title;
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
  if (jsonBook.publishers) {
    book.publisher = jsonBook.publishers[0].name;
  } //TODO if multiple publishers ???

  if (jsonBook.authors) {
    book.author = jsonBook.authors[0].name;
  } //TODO if multiple authors ???

  // TODO categories

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

/**
 * Extracts relevant book information from the provided JSON book object resulting from a "details" request.
 *
 * @param {Object} jsonBook - The JSON book object containing book details.
 * @returns {Object} - The extracted book information.
 */
const getBookFromRequestDetails = (jsonBook) => {
  let book = {};
  if (jsonBook.details) {
    if (jsonBook.details.description) {
      const description = jsonBook.details.description;
      // Check if description is an object with a value property
      if (description.value) {
        book.summary = description.value;
      } else {
        // If description is a string, use it directly
        book.summary = description;
      }
    }
    if (jsonBook.details.languages && jsonBook.details.languages[0]) {
      book.language = jsonBook.details.languages[0].key.split("/").pop(); //get only the language key
    }
    if (jsonBook.details.series) {
      book.series = jsonBook.details.series[0];
    }
    if (jsonBook.details.works && jsonBook.details.works[0]) {
      book.work = jsonBook.details.works[0].key;
    }
  }
  return book;
};

const getBookFromRequestWork = (jsonBook) => {
  let book = {};
  if (jsonBook.description) {
    // Check if description is an object with a value property
    if (jsonBook.description.value) {
      book.summary = jsonBook.description.value;
    } else {
      // If description is a string, use it directly
      book.summary = jsonBook.description;
    }
    return book;
  }
  return null;
};

/**
 * Parses a string representation of a publish date and returns a Date object.
 * Supports all date formats that can be parsed by the Date constructor.
 * Supports two specific formats: "Month Day, Year" and "Month Year".
 *
 * @param {string} dateStr - The string representation of the publish date.
 * @returns {Date|null} The parsed Date object or null if the format is unrecognized.
 */
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

/**
 * Retrieves the translated language name for a given language key.
 * If the language key matches the current language, it returns the current language name.
 * Otherwise, it fetches the language data from the Open Library API and returns the translated language name.
 *
 * @param {string} languageKey - The language key to retrieve the translated language for.
 * @returns {Promise<string>} The translated language name.
 * @throws {Error} If there is an HTTP error while fetching the language data.
 */
const getBookTranslatedLanguage = async (languageKey) => {
  if (languageKey === currentLanguage.urlKey) {
    return currentLanguage.name;
  } else {
    try {
      const response = await fetch(
        `https://openlibrary.org/languages/${languageKey}.json`,
        options
      );
      if (response.ok == true && response.status == 200) {
        const data = await response.json();
        let translatedLanguage = data.name_translated[currentLanguage.code];
        if (translatedLanguage) {
          translatedLanguage =
            translatedLanguage[0].charAt(0).toUpperCase() +
            translatedLanguage[0].slice(1); // Capitalize first letter
          return translatedLanguage;
        }
        return languageKey;
      } else {
        throw new Error("Error HTTP : " + response.status);
      }
    } catch (error) {
      console.error("Error fetching language from Open Library:", error);
      return languageKey;
    }
  }
};
