// React and React Native components and hooks
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Button,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Third-party libraries/components
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MultiSelect } from "react-native-element-dropdown";
import i18next from "../localization/i18n";
import { useTranslation } from "react-i18next";

// Utility functions, constants, and other local imports
import { colors } from "../constants/Colors";
import { BOOK_STATUS, BOOK_STATUS_PROPS } from "../constants/BookStatus";
import ButtonGroup from "./ButtonGroup";
import { getDistinctDB, getDistinctYearDB } from "../requests";

// Constants
//Prportion of the parentView that the filter view will take
const viewProportion = 0.9;

//Props for the radio and check buttons
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
    label: i18next.t("components.filterView.sortOptions.title"),
    value: "title",
    ...radioButtonProps,
  },
  {
    id: "2",
    label: i18next.t("components.filterView.sortOptions.author"),
    value: "author",
    ...radioButtonProps,
  },
  {
    id: "3",
    label: i18next.t("components.filterView.sortOptions.readingDate"),
    value: "readingEndDate",
    ...radioButtonProps,
  },
  {
    id: "4",
    label: i18next.t("components.filterView.sortOptions.additionDate"),
    value: "addedDate",
    ...radioButtonProps,
  },
  {
    id: "5",
    label: i18next.t("components.filterView.sortOptions.rating"),
    value: "rating",
    ...radioButtonProps,
  },
];
const filterStatusItemsData = [
  {
    id: "1",
    label: i18next.t("components.filterView.all"),
    value: "all",
    ...checkButtonProps,
    selected: true,
  },
  {
    id: "2",
    label: BOOK_STATUS_PROPS[BOOK_STATUS.READ].text,
    value: BOOK_STATUS.READ,
    ...checkButtonProps,
  },
  {
    id: "3",
    label: BOOK_STATUS_PROPS[BOOK_STATUS.TO_READ].text,
    value: BOOK_STATUS.TO_READ,
    ...checkButtonProps,
  },
  {
    id: "4",
    label: BOOK_STATUS_PROPS[BOOK_STATUS.READING].text,
    value: BOOK_STATUS.READING,
    ...checkButtonProps,
  },
  {
    id: "5",
    label: BOOK_STATUS_PROPS[BOOK_STATUS.ABANDONED].text,
    value: BOOK_STATUS.ABANDONED,
    ...checkButtonProps,
  },
  {
    id: "6",
    label: BOOK_STATUS_PROPS[BOOK_STATUS.BORROWED].text,
    value: BOOK_STATUS.BORROWED,
    ...checkButtonProps,
  },
  {
    id: "7",
    label: BOOK_STATUS_PROPS[BOOK_STATUS.TO_EXCHANGE].text,
    value: BOOK_STATUS.TO_EXCHANGE,
    ...checkButtonProps,
  },
];

/**
 * Creates an array of filter note items. The first element is "All" and the last one is "No note".
 * The other elements are the notes from 10 to 1.
 * Only the first element is selected.
 *
 * @returns {Array} The array of filter note items.
 */
const createFilterNoteItems = () => {
  let items = [
    {
      id: "11",
      label: i18next.t("components.filterView.all"),
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
    label: i18next.t("components.filterView.noRating"),
    value: "null",
    ...checkButtonProps,
  });
  return items;
};

/**
 * Computes the height of the device's navigation bar (on the bottom of the screen).
 *
 * @returns {number} The height of the device's navigation bar.
 */
const computeDeviceNavigationBarHeight = () => {
  if (Platform.OS === "ios") {
    return 44;
  } else {
    const deviceH = Dimensions.get("screen").height;
    const viewH = Dimensions.get("window").height;
    return deviceH - viewH - StatusBar.currentHeight;
  }
};

/**
 * Converts an array of elements into an array of objects with label and value properties.
 *
 * @param {Array} array - The array of elements to be converted.
 * @returns {Array} - The converted array of objects.
 */
const computeArray = (array) => {
  let result = [];
  array.forEach((element) => {
    result.push({ label: element, value: element });
  });
  return result;
};

const deviceNavigationBarHeight = computeDeviceNavigationBarHeight();

/**
 * Renders a filter view component.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.showFilter - Indicates whether the filter view is visible or not.
 * @param {function} props.setShowFilter - Function to set the visibility of the filter view.
 * @param {boolean} props.previewsLoaded - Indicates whether the previews are loaded or not (if they are, that alow to fetch the data from the db).)
 * @param {function} props.setDbRequest - Function to set the database request.
 * @param {function} props.setDbParams - Function to set the database parameters.
 * @returns {JSX.Element} The filter view component.
 */
export default function FilterView({
  showFilter,
  setShowFilter,
  previewsLoaded,
  setDbRequest,
  setDbParams,
}) {
  //------------------------ Variables and States------------------------
  const { t } = useTranslation();
  const [windowsHeight, setWindowsHeight] = useState(
    Dimensions.get("window").height
  );
  const translateY = useRef(new Animated.Value(windowsHeight)).current; // initial position outside of the screen

  // Data for the check/radio buttons
  const [sortSelectedId, setSortSelectedId] = useState("1");
  const [filterNoteItems, setFilterNoteItem] = useState(createFilterNoteItems);
  const [filterStatusItems, setFilterStatusItem] = useState(
    filterStatusItemsData
  );

  // Data for MultiSelect
  const [allAuthors, setAllAuthors] = useState([]);
  const [allPublishers, setAllPublishers] = useState([]);
  const [allSeries, setAllSeries] = useState([]);
  const [allReadYear, setAllReadYear] = useState([]);

  const [selectedAuthor, setSelectedAuthor] = useState([]);
  const [selectedPublisher, setSelectedPublisher] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState([]);
  const [selectedReadYear, setSelectedReadYear] = useState([]);

  //------------------------ Functions ----------------------------------
  /**
   * Reverse the selected state of the note item with the specified ID.
   * @param {number} id - The ID of the note item.
   */
  const handlePressCheckButtonNote = (id) => {
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
  /**
   * Handles the press event of the check button for a specific item.
   * Toggles the selected status of the item with the given id in the filterStatusItems array.
   * Updates the filterStatusItems state with the new selected status.
   *
   * @param {number} id - The id of the item to toggle the selected status for.
   */
  const handlePressCheckButtonStatus = (id) => {
    const newFilterStatusItems = filterStatusItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          selected: !item.selected,
        };
      }
      return item;
    });
    setFilterStatusItem(newFilterStatusItems);
  };

  /**
   * Handles the apply button press event.
   * Hides the filter view, computes the database request and parameters,
   * and updates the database request and parameters state of the HomeScreen.
   */
  const onApllyPress = () => {
    setShowFilter(false);
    const { request, params } = computeDbRequest();
    //console.log("request = ", request, "params = ", params);
    setDbRequest(request);
    setDbParams(params);
  };

  /**
   * Computes the database request based on the selected filters and sort options.
   * @returns {Object} An object containing the computed request and parameters.
   */
  const computeDbRequest = () => {
    let request = "SELECT * FROM BOOKS";
    let params = [];
    let where = false;
    //Multiselect filters
    for (filter of [
      { array: selectedAuthor, label: "author" },
      { array: selectedPublisher, label: "publisher" },
      { array: selectedSeries, label: "series" },
    ]) {
      if (filter.array.length > 0) {
        request += where ? " AND " : " WHERE ";
        where = true;
        request += `${filter.label} IN (${filter.array
          .map(() => "?")
          .join(", ")})`;
        params = params.concat(filter.array);
      }
    }
    if (selectedReadYear.length > 0) {
      request += where ? " AND " : " WHERE ";
      where = true;
      request += ` strftime('%Y', readingStartDate) IN (${selectedReadYear
        .map(() => "?")
        .join(", ")})`;
      params = params.concat(selectedReadYear);
    }

    //Rating
    if (!filterNoteItems[0].selected) {
      const numberNoteSelected = filterNoteItems.filter(
        (item) => item.selected
      ).length;
      let orStatement = false;
      if (filterNoteItems[filterNoteItems.length - 1].selected) {
        request += where ? " AND ( " : " WHERE ( ";
        where = true;
        orStatement = true;
        request += ` rating IS NULL `;
      }
      if (
        (filterNoteItems[filterNoteItems.length - 1].selected &&
          numberNoteSelected > 1) ||
        numberNoteSelected > 0
      ) {
        console.log("here");
        request += where ? (orStatement ? "OR" : " AND ") : " WHERE ";
        where = true;
        request += ` rating IN (${filterNoteItems
          .filter((item) => item.selected && item.value !== "null")
          .map(() => "?")
          .join(", ")})`;
        params = params.concat(
          filterNoteItems
            .filter((item) => item.selected && item.value !== "null")
            .map((item) => item.value)
        );
      }
      if (filterNoteItems[filterNoteItems.length - 1].selected) {
        request += " ) ";
      }
    }

    //Status
    let orStatement = false;
    if (!filterStatusItems[0].selected) {
      const statusSelected = filterStatusItems.filter(
        (item) => item.selected && item.id > 1 && item.id < 6
      );
      if (statusSelected.length > 0) {
        request += where ? " AND ( " : " WHERE ( ";
        where = true;
        orStatement = true;
        request += ` status IN (${statusSelected.map(() => "?").join(", ")})`;
        params = params.concat(statusSelected.map((item) => item.value));
      }
    }
    if (filterStatusItems[5].selected) {
      //Borrowed
      request += where ? (orStatement ? " OR " : " AND ( ") : " WHERE ( ";
      where = true;
      orStatement = true;
      request += ` borrowed = 1`;
    }
    if (filterStatusItems[6].selected) {
      //To exchange
      request += where ? (orStatement ? " OR " : " AND ( ") : " WHERE ( ";
      where = true;
      orStatement = true;
      request += ` toExchange = 1`;
    }
    if (orStatement) {
      request += " ) ";
    }

    //Sort
    const sort = sortItems.find((item) => item.id === sortSelectedId);
    request += ` ORDER BY ${sort.value} ${
      sort.value === "title" || sort.value === "author" ? "ASC" : "DESC"
    } `;

    request += ";";
    console.log("request = ", request, "params = ", params);
    return { request, params };
  };

  //------------------------ UseEffects ---------------------------------

  // Fetch the data for the multiselect filters only when the previews are loaded (to avoid conflicts with the db)
  useEffect(() => {
    if (previewsLoaded) {
      setAllAuthors(computeArray(getDistinctDB({ field: "author" })));
      setAllPublishers(computeArray(getDistinctDB({ field: "publisher" })));
      setAllSeries(computeArray(getDistinctDB({ field: "series" })));
      setAllReadYear(computeArray(getDistinctYearDB({ end: true })));
    }
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

  // Animate the filter view when the showFilter state changes
  useEffect(() => {
    Animated.timing(translateY, {
      toValue: showFilter
        ? windowsHeight * (1 - viewProportion)
        : windowsHeight,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showFilter]);

  //------------------------ Render ----------------------------------

  return (
    <Animated.View
      style={[styles.filterContainer, { transform: [{ translateY }] }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {t("components.filterView.title")}
        </Text>
        <View style={styles.cancelIconContainer}>
          <MaterialCommunityIcons.Button
            name="close"
            color={colors.black}
            backgroundColor="transparent"
            onPress={() => setShowFilter(false)}
            iconStyle={{ marginRight: 0 }}
            underlayColor={colors.underlayColor}
          />
        </View>
        <View style={styles.applyIconContainer}>
          <MaterialCommunityIcons.Button
            name="check"
            color={colors.black}
            backgroundColor="transparent"
            onPress={onApllyPress}
            iconStyle={{ marginRight: 0 }}
            underlayColor={colors.underlayColor}
          />
        </View>
      </View>
      <View style={styles.line} />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.subTitle}>
          {t("components.filterView.subtitles.sort")}
        </Text>
        <ButtonGroup
          type={"radio"}
          buttonsData={sortItems}
          onPress={setSortSelectedId}
          selectedId={sortSelectedId}
          containerStyle={styles.buttonGroupContainer}
        />

        <Text style={styles.subTitle}>
          {t("components.filterView.subtitles.statusFilter")}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <ButtonGroup
            type={"check"}
            buttonsData={filterStatusItems}
            onPress={handlePressCheckButtonStatus}
            containerStyle={[styles.buttonGroupContainer, { flex: 1 }]}
            endId={4}
          />
          <ButtonGroup
            type={"check"}
            buttonsData={filterStatusItems}
            onPress={handlePressCheckButtonStatus}
            containerStyle={[styles.buttonGroupContainer, { flex: 1 }]}
            startId={5}
          />
        </View>
        <Text style={styles.subTitle}>
          {t("components.filterView.subtitles.ratingFilter")}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <ButtonGroup
            type={"check"}
            buttonsData={filterNoteItems}
            onPress={handlePressCheckButtonNote}
            containerStyle={[styles.buttonGroupContainer, { flex: 1 }]}
            startId={6}
          />
          <ButtonGroup
            type={"check"}
            buttonsData={filterNoteItems}
            onPress={handlePressCheckButtonNote}
            containerStyle={[styles.buttonGroupContainer, { flex: 1 }]}
            endId={5}
          />
        </View>
        <Text style={styles.subTitle}>
          {t("components.filterView.subtitles.otherFilters")}
        </Text>
        <MultiSelect
          {...multiSelectProps}
          placeholder={
            selectedAuthor.length > 0
              ? t("components.filterView.multiselectPlaceholder.authors")
              : t("components.filterView.multiselectPlaceholder.allAuthors")
          }
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
            selectedPublisher.length > 0
              ? t("components.filterView.multiselectPlaceholder.publishers")
              : t("components.filterView.multiselectPlaceholder.allPublishers")
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
          placeholder={
            selectedSeries.length > 0
              ? t("components.filterView.multiselectPlaceholder.series")
              : t("components.filterView.multiselectPlaceholder.allSeries")
          }
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
            selectedReadYear.length > 0
              ? t("components.filterView.multiselectPlaceholder.years")
              : t("components.filterView.multiselectPlaceholder.allYears")
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
          <Button
            title={t("components.filterView.applyButton")}
            onPress={onApllyPress}
          />
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
  searchPlaceholder: i18next.t("components.filterView.searchPlaceholder"),
  inverted: false,
  selectedStyle: styles.selectedStyle,
};
