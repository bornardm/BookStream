import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";

import { colors } from "../constants/Colors";
import ButtonGroup from "./ButtonGroup";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
const radioButtonProps = {
  selectedColor: "gold",
  unselectedColor: colors.middleLightGrey,
  size: 15,
};

const checkButtonProps = {
  selectedColor: "gold",
  unselectedColor: colors.middleLightGrey,
  size: 17,
  selected: false,
};

const sortItems = [
  {
    id: "1", // acts as a key, must be unique
    label: "Title (alphabetical)",
    value: "title",
    ...radioButtonProps,
  },
  {
    id: "2",
    label: "Author (alphabetical)",
    value: "author",
    ...radioButtonProps,
  },
  {
    id: "3",
    label: "Reading date (newest)",
    value: "readingDate",
    ...radioButtonProps,
  },
  {
    id: "4",
    label: "Date of addition to my books (newest)",
    value: "additionDate",
    ...radioButtonProps,
  },
  {
    id: "5",
    label: "Rating (highest)",
    value: "rating",
    ...radioButtonProps,
  },
];

const viewProportion = 0.9;

const createFilterNoteItems = () => {
  let items = [
    {
      id: "11",
      label: "All",
      value: "all",
      ...checkButtonProps,
      selected: true,
    },
  ];
  for (let i = 10; i >= 1; i--) {
    items.push({
      id: i.toString(),
      label: i + " stars",
      value: i.toString(),
      ...checkButtonProps,
    });
  }
  items.push({
    id: "0",
    label: "No note",
    value: "null",
    ...checkButtonProps,
  });
  return items;
};

export default function FilterView({ showFilter, setShowFilter }) {
  const [windowsHeight, setWindowsHeight] = useState(
    Dimensions.get("window").height
  );
  const [selectedId, setSelectedId] = useState("1");
  const [filterNoteItems, setFilterNoteItem] = useState(createFilterNoteItems);
  const translateY = useRef(new Animated.Value(windowsHeight)).current; // initial position outside of the screen

  const handlePressCheckButton = (id) => {
    const newFilterNoteItems = filterNoteItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          selected: !item.selected,
        };
      }
      return item;
    });
    setFilterNoteItem(newFilterNoteItems);
  };

  // Update height when the screen dimensions change
  useEffect(() => {
    const onChange = () => {
      console.log(Dimensions.get("window").height);
      setWindowsHeight(Dimensions.get("window").height);
    };

    // Subscribe to dimension changes and save the subscription
    const subscription = Dimensions.addEventListener("change", onChange);

    // Return a cleanup function that removes the event listener
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: showFilter
        ? windowsHeight * (1 - viewProportion)
        : windowsHeight,
      duration: 300,
      useNativeDriver: true,
    }).start();
    console.log("showFilter changed");
  }, [showFilter]);

  return (
    <Animated.View
      style={[
        styles.filterContainer,
        { height: viewProportion * windowsHeight, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Sorting and filters</Text>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons.Button
            name="close"
            color={colors.black}
            backgroundColor="transparent"
            onPress={() => setShowFilter(false)}
            iconStyle={{ marginRight: 0 }}
          />
        </View>
      </View>
      <View style={styles.line} />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.subTitle}>Sort by</Text>
        <ButtonGroup
          type={"radio"}
          radioButtons={sortItems}
          onPress={setSelectedId}
          selectedId={selectedId}
          containerStyle={styles.buttonGroupContainer}
        />
        <Text style={styles.subTitle}>Filter by notes</Text>
        <View style={{ flexDirection: "row" }}>
          <ButtonGroup
            type={"check"}
            radioButtons={filterNoteItems}
            onPress={handlePressCheckButton}
            containerStyle={[styles.buttonGroupContainer, { flex: 1 }]}
            startId={6}
          />
          <ButtonGroup
            type={"check"}
            radioButtons={filterNoteItems}
            onPress={handlePressCheckButton}
            containerStyle={[styles.buttonGroupContainer, { flex: 1 }]}
            endId={5}
          />
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "transparent",
  },
  filterContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 15,
  },
  line: {
    height: 1,
    backgroundColor: colors.lightGrey,
  },
  scrollView: {
    width: "100%",
    backgroundColor: "transparent",
    padding: 10,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  buttonGroupContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
});
