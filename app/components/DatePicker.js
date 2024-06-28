// React and React Native components and hooks
import React, { useEffect, useState, Suspense } from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";

// Third-party libraries/components
import DateTimePicker from "@react-native-community/datetimepicker";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// Utility functions, constants, and other local imports
import { BOOK_STATUS } from "../constants/BookStatus";
import { colors } from "../constants/Colors";
import {
  updateBookEndDateDB,
  updateBookStartDateDB,
  updateBookStatusDB,
} from "../requests";

/**
 * DatePicker component for selecting start and end dates for reading a book.
 * @param {Object} props - The component props.
 * @param {integer} props.bookID - The ID of the book.
 * @param {string} props.initialStartDate - The initial start date for the book reading.
 * @param {string} props.initialEndDate - The initial end date for the book reading.
 * @param {Function} props.updateStateBookFunc - The function to update the state of the book.
 * @returns {JSX.Element} The DatePicker component.
 */
export default function DatePicker({
  bookID,
  initialStartDate,
  initialEndDate,
  updateStateBookFunc,
}) {
  const [dateStart, setDateStart] = useState(null);
  const [showStart, setShowStart] = useState(false);
  const [dateEnd, setDateEnd] = useState(null);
  const [showEnd, setShowEnd] = useState(false);

  useEffect(() => {
    setDateStart(initialStartDate ? new Date(initialStartDate) : null);
    setDateEnd(initialEndDate ? new Date(initialEndDate) : null);
  }, []);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={() => setShowStart(true)}>
        <View style={styles.touchable}>
          <MaterialCommunityIcons
            name="calendar-arrow-right"
            size={20}
            color={colors.grey}
            style={{ marginRight: 5 }}
          />

          <Text style={styles.text}>
            {dateStart
              ? dateStart.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : " Start of reading"}
          </Text>

          {showStart && (
            <DateTimePicker
              mode="date"
              value={dateStart ? dateStart : new Date()}
              display="default"
              minimumDate={null}
              maximumDate={dateEnd}
              onChange={(event, selectedDate) => {
                if (selectedDate && event.type === "set") {
                  setDateStart(selectedDate);
                  updateBookStartDateDB({
                    id: bookID,
                    startDate: selectedDate.toISOString().slice(0, 10),
                  });
                }
                setShowStart(false);
              }}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.margin} />
      <TouchableWithoutFeedback onPress={() => setShowEnd(true)}>
        <View style={styles.touchable}>
          <MaterialCommunityIcons
            name="calendar-check"
            size={20}
            color={colors.grey}
            style={{ marginRight: 5 }}
          />

          <Text style={styles.text}>
            {dateEnd
              ? dateEnd.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : " End of reading"}
          </Text>

          {showEnd && (
            <DateTimePicker
              mode="date"
              value={dateEnd ? dateEnd : new Date()}
              display="default"
              minimumDate={dateStart}
              maximumDate={null}
              onChange={(event, selectedDate) => {
                setShowEnd(false);
                if (selectedDate && event.type === "set") {
                  setDateEnd(selectedDate);

                  updateBookEndDateDB({
                    id: bookID,
                    endDate: selectedDate.toISOString().slice(0, 10),
                  });
                  //Change the status of the book to "read"
                  updateStateBookFunc({ status: BOOK_STATUS.READ });
                  updateBookStatusDB({ id: bookID, status: BOOK_STATUS.READ });
                }
              }}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: 10,
  },
  margin: {
    width: 20,
  },
  touchable: {
    backgroundColor: colors.lightGrey,
    borderColor: colors.middleLightGrey,
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    flexDirection: "row",
    flex: 1,
  },
  text: {
    color: colors.grey,
  },
});
