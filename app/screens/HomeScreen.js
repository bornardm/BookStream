// React and React Native components and hooks
import React, { Suspense, useEffect, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";

// Third-party libraries/components
import Icon from "react-native-vector-icons/Entypo";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { SQLiteProvider } from "expo-sqlite/next";

// Utility functions, constants, and other local imports
import BookPreview from "../components/BookPreview";
import LoadindingView from "../components/LoadingView";
import { colors } from "../constants/Colors";
import { dbName } from "../setupDatabase";
import { fetchBookPreview } from "../requests";
import FilterView from "../components/FilterView";

let selectedSortItem = ""; //useful only at the beginning to set the default sort option or the saved one from the DB
let selectedSortSet = false;
export const setSelectedSortItem = (value) => {
  selectedSortItem = value;
  selectedSortSet = true;
};

export default function HomeScreen({ navigation }) {
  //------------------------ Variables and States------------------------
  const [allBookPreview, setAllBookPreview] = useState(null);
  const [previewsLoaded, setPreviewsLoaded] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [dbRequest, setDbRequest] = useState("");
  const [dbParams, setDbParams] = useState(null);

  //------------------------ Functions ----------------------------------

  function updateBookPreview(updatedPreview) {
    setAllBookPreview((prevBookPreviews) => {
      return prevBookPreviews.map((bookPreview) =>
        bookPreview.id === updatedPreview.id ? updatedPreview : bookPreview
      );
    });
  }
  function deleteBookPreview(bookIdToDelete) {
    setAllBookPreview((prevBookPreviews) => {
      return prevBookPreviews.filter(
        (bookPreview) => bookPreview.id !== bookIdToDelete
      );
    });
  }
  function addBookPreview(newPreview) {
    setAllBookPreview((prevBookPreviews) => {
      return [...prevBookPreviews, newPreview];
    });
  }

  //------------------------ UseEffects ---------------------------------

  useEffect(() => {
    /**
     * Fetches book previews and updates the state with the fetched data.
     * @returns {Promise<void>} A promise that resolves when the book previews are fetched and the state is updated.
     */
    const fetchPreviews = async () => {
      const fetchedPreviews = await fetchBookPreview({
        request: dbRequest,
        params: dbParams,
      });
      setAllBookPreview(fetchedPreviews);
      if (fetchedPreviews) {
        setPreviewsLoaded(true);
      }
    };
    if (selectedSortSet) {
      if (dbParams !== null) {
        fetchPreviews();
      } else {
        setDbParams([]);
        setDbRequest(
          `SELECT * FROM BOOKS ORDER BY ${selectedSortItem} ${
            selectedSortItem === "title" || selectedSortItem === "author"
              ? "ASC"
              : "DESC"
          } ;`
        );
      }
    }
  }, [dbParams, selectedSortSet]);

  return (
    <Suspense fallback={<LoadindingView />}>
      <SQLiteProvider databaseName={dbName} useSuspense>
        <View style={styles.container}>
          <ScrollView style={styles.scrollView}>
            {previewsLoaded &&
              allBookPreview.map((book, index) => (
                <BookPreview
                  key={index}
                  bookID={book.id}
                  title={book.title}
                  author={book.author}
                  rating={book.rating}
                  status={book.status}
                  imageName={book.imageName}
                  functions={{
                    updateBookPreviewFunc: updateBookPreview,
                    deleteBookPreviewFunc: deleteBookPreview,
                  }}
                />
              ))}
          </ScrollView>
          <View style={[styles.circleButton, styles.filterButton]}>
            <TouchableOpacity
              onPress={() => {
                setShowFilter(!showFilter);
              }}
            >
              <MaterialIcons style={styles.iconFilter} name="filter-list" />
            </TouchableOpacity>
          </View>
          <View style={[styles.circleButton, styles.plusButton]}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("AddScreen", {
                  addBookPreviewFunc: addBookPreview,
                  functions: {
                    updateBookPreviewFunc: updateBookPreview,
                    deleteBookPreviewFunc: deleteBookPreview,
                  },
                });
              }}
            >
              <Icon name="plus" style={styles.iconPlus} />
            </TouchableOpacity>
          </View>
          {showFilter && <View style={styles.overlay}></View>}
          <FilterView
            showFilter={showFilter}
            setShowFilter={setShowFilter}
            previewsLoaded={previewsLoaded}
            setDbRequest={setDbRequest}
            setDbParams={setDbParams}
            selectedSortItem={selectedSortItem}
          />
        </View>
      </SQLiteProvider>
    </Suspense>
  );
}

const circleButtonRadius = 100;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
    zIndex: 0, // Ensure it's below the FilterView but above other content
  },
  scrollView: {
    width: "100%",
    backgroundColor: "transparent",
  },
  filterButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  filterIcon: {
    paddingRight: 0,
    borderRadius: 24,
    backgroundColor: colors.secondary,
  },
  plusButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  circleButton: {
    backgroundColor: colors.secondary,
    margin: 20,
    width: circleButtonRadius / 2,
    height: circleButtonRadius / 2,
    borderRadius: circleButtonRadius,
    fontSize: circleButtonRadius * 2,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  iconPlus: {
    fontSize: circleButtonRadius / 2,
    color: colors.white,
    backgroundColor: "transparent",
  },
  iconFilter: {
    fontSize: circleButtonRadius / 3,
    color: colors.white,
    backgroundColor: "transparent",
  },
});
