import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  Text,
} from "react-native";
//Icons
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import Octicons from "react-native-vector-icons/Octicons";
import { colors } from "../constants/Colors";

/**
 * Renders a book status selector component.
 *
 * @param {Object} props - The component props.
 * @param {string} props.status - The current status of the book in  "Read", "Want to read",  "In reading","Abandoned",.
 * @param {boolean} props.Borrowed - Indicates if the book is borrowed.
 * @param {boolean} props.ToExchange - Indicates if the book is available for exchange.
 * @returns {JSX.Element} The book status selector component.
 */
export function BookStatusSelector({ status, borrowed, toExchange }) {
  const initSelectedStatus = (status, borrowed, toExchange) => {
    const borrowedSelected = borrowed ? 1 : 0;
    const toExchangeSelected = toExchange ? 1 : 0;
    if (status === "Read") {
      return [1, 0, 0, 0, borrowedSelected, toExchangeSelected];
    } else if (status === "Want to read") {
      return [0, 1, 0, 0, borrowedSelected, toExchangeSelected];
    } else if (status === "In reading") {
      return [0, 0, 1, 0, borrowedSelected, toExchangeSelected];
    } else if (status === "Abandoned") {
      return [0, 0, 0, 1, borrowedSelected, toExchangeSelected];
    } else {
      return [0, 0, 0, 0, borrowedSelected, toExchangeSelected];
    }
  };
  function handleSelectorPress(index) {
    setSelectedStatus((prevStatuses) => {
      const newStatuses = [...prevStatuses]; // create a copy of the array
      const newValue = newStatuses[index] === 0 ? 1 : 0;
      //At most one from the 4 first statuses can be selected
      if (index < 4) {
        newStatuses.fill(0, 0, 4); // set the first four elements to 0
      }
      newStatuses[index] = newValue;
      return newStatuses; // return the updated array
    });
  }

  const [selectedStatus, setSelectedStatus] = useState(
    initSelectedStatus(status, borrowed, toExchange)
  );
  const selectors = [
    { text: "Read", iconLibrary: Octicons, iconName: "check-circle-fill" },
    { text: "Want to read", iconLibrary: Feather, iconName: "book" },
    {
      text: "In reading",
      iconLibrary: MaterialCommunityIcons,
      iconName: "book-open-page-variant-outline",
    },
    {
      text: "Abandoned",
      iconLibrary: MaterialCommunityIcons,
      iconName: "book-off-outline",
    },
    {
      text: "Borrowed",
      iconLibrary: MaterialCommunityIcons,
      iconName: "book-clock-outline",
    },
    {
      text: "To Exchange",
      iconLibrary: MaterialCommunityIcons,
      iconName: "swap-horizontal",
    },
  ];

  return (
    <ScrollView
      style={styles.scrollView}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
    >
      {selectors.map((value, index) => {
        const IconComponent = value.iconLibrary;
        const isSelected = selectedStatus[index];
        return (
          <View key={index} style={styles.statusContainer}>
            <TouchableWithoutFeedback
              onPress={() => {
                console.log(`Status ${value.text} was pressed.`);
                handleSelectorPress(index);
              }}
            >
              <View
                style={[
                  styles.iconCercle,
                  isSelected && styles.iconCercleSelected,
                ]}
              >
                <IconComponent
                  name={value.iconName}
                  style={[styles.icon, isSelected && styles.iconSelected]}
                />
              </View>
            </TouchableWithoutFeedback>
            <Text>{value.text}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
const iconCercleSize = 45;
const styles = StyleSheet.create({
  scrollView: {
    flexDirection: "row",
    width: "100%",
  },
  statusContainer: {
    margin: 10,
    alignItems: "center",
  },
  icon: {
    fontSize: iconCercleSize / 2,
    color: "#808080",
  },
  iconSelected: {
    color: colors.white,
  },
  iconCercle: {
    backgroundColor: "#ececec",
    padding: 5,
    width: iconCercleSize,
    height: iconCercleSize,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCercleSelected: {
    backgroundColor: "gold",
  },
});
