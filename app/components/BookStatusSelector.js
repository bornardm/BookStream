import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  Text,
} from "react-native";
import { colors } from "../constants/Colors";
import { BOOK_STATUS, BOOK_STATUS_PROPS } from "../constants/BookStatus";

/**
 * Renders a book status selector component.
 *
 * @param {Object} props - The component props.
 * @param {integer} props.status - The current id status of the book in  0,1,2,3,4,5.
 * @param {boolean} props.Borrowed - Indicates if the book is borrowed.
 * @param {boolean} props.ToExchange - Indicates if the book is available for exchange.
 * @returns {JSX.Element} The book status selector component.
 */
export function BookStatusSelector({ status, borrowed, toExchange }) {
  const initSelectedStatus = (status, borrowed, toExchange) => {
    const borrowedSelected = borrowed ? 1 : 0;
    const toExchangeSelected = toExchange ? 1 : 0;
    if (status === BOOK_STATUS.READ) {
      return [1, 0, 0, 0, borrowedSelected, toExchangeSelected];
    } else if (status === BOOK_STATUS.TO_READ) {
      return [0, 1, 0, 0, borrowedSelected, toExchangeSelected];
    } else if (status === BOOK_STATUS.READING) {
      return [0, 0, 1, 0, borrowedSelected, toExchangeSelected];
    } else if (status === BOOK_STATUS.ABANDONED) {
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

  return (
    <ScrollView
      style={styles.scrollView}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
    >
      {BOOK_STATUS_PROPS.map((value, index) => {
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
