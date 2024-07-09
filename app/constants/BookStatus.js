import React from "react";
//Icons
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import Octicons from "react-native-vector-icons/Octicons";
//i18n
import i18next from "../localization/i18n";

// Mapping betwen the status of the book and the status of the book in the database
export const BOOK_STATUS = {
  READ: 0,
  TO_READ: 1,
  READING: 2,
  ABANDONED: 3,
  BORROWED: 4,
  TO_EXCHANGE: 5,
};

let defaultBookStatus = BOOK_STATUS.TO_READ;

export const getDefaultBookStatus = () => {
  console.log(defaultBookStatus);
  return defaultBookStatus;
};

export const setDefaultBookStatus = (newStatus) => {
  defaultBookStatus = newStatus;
};

//props of the status
const setBookStatusProps = () => {
  return [
    {
      text: i18next.t("constants.bookStatus.read"),
      iconLibrary: Octicons,
      iconName: "check-circle-fill",
      color: "#32CD32", //LimeGreen
    },
    {
      text: i18next.t("constants.bookStatus.wantToRead"),
      iconLibrary: Feather,
      iconName: "book",
      color: "#00BFFF", //#48D1CC
    },
    {
      text: i18next.t("constants.bookStatus.reading"),
      iconLibrary: MaterialCommunityIcons,
      iconName: "book-open-page-variant-outline",
      color: "#F4A460", //SandyBrown
    },
    {
      text: i18next.t("constants.bookStatus.abandoned"),
      iconLibrary: MaterialCommunityIcons,
      iconName: "book-off-outline",
      color: "#FF6347", //Tomato
    },
    {
      text: i18next.t("constants.bookStatus.borrowed"),
      iconLibrary: MaterialCommunityIcons,
      iconName: "book-clock-outline",
      color: "#9370DB", //MediumPurple
    },
    {
      text: i18next.t("constants.bookStatus.toExchange"),
      iconLibrary: MaterialCommunityIcons,
      iconName: "swap-horizontal",
      color: "#48D1CC", //MediumTurquoise
    },
  ];
};
let BOOK_STATUS_PROPS = setBookStatusProps();

// Listen for language changes
i18next.on("languageChanged", () => {
  BOOK_STATUS_PROPS = setBookStatusProps(); // Update BOOK_STATUS_PROPS on language change
});

export const getBookStatusProps = () => BOOK_STATUS_PROPS;
