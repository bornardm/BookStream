import React from "react";
//Icons
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import Octicons from "react-native-vector-icons/Octicons";
// Mapping betwen the status of the book and the status of the book in the database
export const BOOK_STATUS = {
  READ: 0,
  TO_READ: 1,
  READING: 2,
  ABANDONED: 3,
  BORROWED: 4,
  TO_EXCHANGE: 5,
};

export const defaultStatus = BOOK_STATUS.TO_READ;
//props of the status
export const BOOK_STATUS_PROPS = [
  {
    text: "Read",
    iconLibrary: Octicons,
    iconName: "check-circle-fill",
    color: "#32CD32", //LimeGreen
  },
  {
    text: "Want to read",
    iconLibrary: Feather,
    iconName: "book",
    color: "#00BFFF", //#48D1CC
  },
  {
    text: "In reading",
    iconLibrary: MaterialCommunityIcons,
    iconName: "book-open-page-variant-outline",
    color: "#F4A460", //SandyBrown
  },
  {
    text: "Abandoned",
    iconLibrary: MaterialCommunityIcons,
    iconName: "book-off-outline",
    color: "#FF6347", //Tomato
  },
  {
    text: "Borrowed",
    iconLibrary: MaterialCommunityIcons,
    iconName: "book-clock-outline",
    color: "#9370DB", //MediumPurple
  },
  {
    text: "To Exchange",
    iconLibrary: MaterialCommunityIcons,
    iconName: "swap-horizontal",
    color: "#48D1CC", //MediumTurquoise
  },
];
