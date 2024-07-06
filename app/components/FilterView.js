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
  StatusBar,
  Platform,
} from "react-native";

import { colors } from "../constants/Colors";
import ButtonGroup from "./ButtonGroup";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MultiSelect } from "react-native-element-dropdown";
import { getDistinctDB, getDistinctYearDB } from "../requests";

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
const filterStatusItems = [
  {
    id: "1",
    label: "All",
    value: "all",
    ...checkButtonProps,
    selected: true,
  },
  {
    id: "2",
    label: "Read",
    value: "read",
    ...checkButtonProps,
  },
  {
    id: "3",
    label: "Want to read",
    value: "toRead",
    ...checkButtonProps,
  },
  {
    id: "4",
    label: "Reading",
    value: "reading",
    ...checkButtonProps,
  },
  {
    id: "5",
    label: "Abandoned",
    value: "abandoned",
    ...checkButtonProps,
  },
  {
    id: "6",
    label: "Borrowed",
    value: "borrowed",
    ...checkButtonProps,
  },
  {
    id: "7",
    label: "To exchange",
    value: "toExchange",
    ...checkButtonProps,
  },
];

const viewProportion = 0.9;
const computeDeviceNavigationBarHeight = () => {
  if (Platform.OS === "ios") {
    return 44;
  } else {
    const deviceH = Dimensions.get("screen").height;
    const viewH = Dimensions.get("window").height;
    return deviceH - viewH - StatusBar.currentHeight;
  }
};
const computeArray = (array) => {
  let result = [];
  array.forEach((element) => {
    result.push({ label: element, value: element });
  });
  return result;
};

const deviceNavigationBarHeight = computeDeviceNavigationBarHeight();
console.log("deviceNavigationBarHeight", deviceNavigationBarHeight);

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

export default function FilterView({
  showFilter,
  setShowFilter,
  previewsLoaded,
}) {
  const [windowsHeight, setWindowsHeight] = useState(
    Dimensions.get("window").height
  );
  const [selectedId, setSelectedId] = useState("1");
  const [filterNoteItems, setFilterNoteItem] = useState(createFilterNoteItems);
  const [selectedAuthor, setSelectedAuthor] = useState([]);
  const [selectedPublisher, setSelectedPublisher] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState([]);
  const [selectedReadYear, setSelectedReadYear] = useState([]);
  const translateY = useRef(new Animated.Value(windowsHeight)).current; // initial position outside of the screen

  const [allAuthors, setAllAuthors] = useState([]);
  const [allPublishers, setAllPublishers] = useState([]);
  const [allSeries, setAllSeries] = useState([]);
  const [allReadYear, setAllReadYear] = useState([]);

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

  useEffect(() => {
    if (previewsLoaded) {
      setAllAuthors(computeArray(getDistinctDB({ field: "author" })));
      setAllPublishers(computeArray(getDistinctDB({ field: "publisher" })));
      setAllSeries(computeArray(getDistinctDB({ field: "series" })));
      setAllReadYear(computeArray(getDistinctYearDB({ end: true })));
    }
    console.log("allAuthors", allAuthors);
    console.log("allPublishers", allPublishers);
    console.log("allSeries", allSeries);
    console.log("allReadYear", allReadYear);
  }, [previewsLoaded]);

  // Update height when the screen dimensions change
  useEffect(() => {
    const onChange = () => {
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
  }, [showFilter]);

  return (
    <Animated.View
      style={[styles.filterContainer, { transform: [{ translateY }] }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Sorting and filters</Text>
        <View style={styles.cancelIconContainer}>
          <MaterialCommunityIcons.Button
            name="close"
            color={colors.black}
            backgroundColor="transparent"
            onPress={() => setShowFilter(false)}
            iconStyle={{ marginRight: 0 }}
            underlayColor={"rgba(0,0,0,0.1)"}
          />
        </View>
        <View style={styles.applyIconContainer}>
          <MaterialCommunityIcons.Button
            name="check"
            color={colors.black}
            backgroundColor="transparent"
            onPress={() => setShowFilter(false)}
            iconStyle={{ marginRight: 0 }}
            underlayColor={"rgba(0,0,0,0.1)"}
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

        <Text style={styles.subTitle}>Filter by status</Text>
        <View style={{ flexDirection: "row" }}>
          <ButtonGroup
            type={"check"}
            radioButtons={filterStatusItems}
            onPress={handlePressCheckButton}
            containerStyle={[styles.buttonGroupContainer, { flex: 1 }]}
            endId={4}
          />
          <ButtonGroup
            type={"check"}
            radioButtons={filterStatusItems}
            onPress={handlePressCheckButton}
            containerStyle={[styles.buttonGroupContainer, { flex: 1 }]}
            startId={5}
          />
        </View>
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
        <Text style={styles.subTitle}>Other filters</Text>
        <MultiSelect
          {...multiSelectProps}
          placeholder={selectedAuthor.length > 0 ? "Authors : " : "All authors"}
          value={selectedAuthor}
          data={allAuthors}
          onChange={(item) => {
            setSelectedAuthor(item);
          }}
          renderLeftIcon={() => (
            <MaterialCommunityIcons
              style={styles.icon}
              color="black"
              name="account-search"
              size={20}
            />
          )}
        />
        <MultiSelect
          {...multiSelectProps}
          placeholder={
            selectedPublisher.length > 0 ? "Publishers : " : "All publishers"
          }
          value={selectedPublisher}
          data={allPublishers}
          onChange={(item) => {
            setSelectedPublisher(item);
          }}
          renderLeftIcon={() => (
            <MaterialCommunityIcons
              style={styles.icon}
              color="black"
              name="briefcase-search"
              size={20}
            />
          )}
        />
        <MultiSelect
          {...multiSelectProps}
          placeholder={selectedSeries.length > 0 ? "Series : " : "All series"}
          value={selectedSeries}
          data={allSeries}
          onChange={(item) => {
            setSelectedSeries(item);
          }}
          renderLeftIcon={() => (
            <MaterialCommunityIcons
              style={styles.icon}
              color="black"
              name="book-search"
              size={20}
            />
          )}
        />
        <MultiSelect
          {...multiSelectProps}
          placeholder={
            selectedReadYear.length > 0 ? "Reading year : " : "All reading year"
          }
          value={selectedReadYear}
          data={allReadYear}
          onChange={(item) => {
            setSelectedReadYear(item);
          }}
          renderLeftIcon={() => (
            <MaterialCommunityIcons
              style={styles.icon}
              color="black"
              name="calendar-search"
              size={20}
            />
          )}
        />
        <View style={styles.applyButton}>
          <Button title="Apply" onPress={() => setShowFilter(false)} />
        </View>
        <View style={styles.marginView} />
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
  cancelIconContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "transparent",
  },
  applyIconContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  filterContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: deviceNavigationBarHeight,
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
    marginBottom: 15,
  },
  applyButton: {
    margin: 20,
  },
  marginView: {
    height: 50,
  },
  // MultiSelect styles
  dropdown: {
    height: 50,
    backgroundColor: "transparent",
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    marginBottom: 10,
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 12,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  selectedStyle: {
    borderRadius: 15,
    backgroundColor: colors.lightGrey,
  },
});

const multiSelectProps = {
  style: styles.dropdown,
  placeholderStyle: styles.placeholderStyle,
  selectedTextStyle: styles.selectedTextStyle,
  inputSearchStyle: styles.inputSearchStyle,
  iconStyle: styles.iconStyle,
  search: true,
  labelField: "label",
  valueField: "value",
  searchPlaceholder: "Search...",
  inverted: false,
  selectedStyle: styles.selectedStyle,
};
