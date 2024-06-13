import React, { useState, useEffect, Suspense } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Image,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../constants/Colors";
import { updateBookStartDateDB, updateBookEndDateDB } from "../requests";

export default function DatePicker({
  bookID,
  initialStartDate,
  initialEndDate,
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
                  console.log(selectedDate.toISOString().slice(0, 10));
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
                if (selectedDate && event.type === "set") {
                  console.log(selectedDate);
                  setDateEnd(selectedDate);

                  updateBookEndDateDB({
                    id: bookID,
                    endDate: selectedDate.toISOString().slice(0, 10),
                  });
                }
                setShowEnd(false);
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
