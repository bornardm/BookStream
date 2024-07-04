// React and React Native components and hooks
import React, { Suspense, useEffect, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
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

export default function HomeScreen({ navigation }) {
  //------------------------ Variables and States------------------------
  const [allBookPreview, setAllBookPreview] = useState(null);
  const [previewsLoaded, setPreviewsLoaded] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

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
      const fetchedPreviews = await fetchBookPreview();
      setAllBookPreview(fetchedPreviews);
      if (fetchedPreviews) {
        setPreviewsLoaded(true);
      }
    };

    fetchPreviews();
  }, []);

  return (
    <Suspense fallback={<LoadindingView />}>
      <SQLiteProvider databaseName={dbName} useSuspense>
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialIcons
              name="filter-list"
              size={24}
              onPress={() => {
                setShowFilter(!showFilter);
              }}
            />
          </View>
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
          <View style={styles.addBook}>
            <TouchableWithoutFeedback
              onPress={() => {
                console.log("Add book button pressed");
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
            </TouchableWithoutFeedback>
          </View>
          {showFilter && <View style={styles.overlay}></View>}
          <FilterView showFilter={showFilter} setShowFilter={setShowFilter} />
        </View>
      </SQLiteProvider>
    </Suspense>
  );
}

const addBookButtonRadius = 100;
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
  header: {
    height: 50,
    backgroundColor: "red",
  },
  addBook: {
    backgroundColor: colors.secondary,

    position: "absolute",
    bottom: 0,
    right: 0,
    margin: 20,
    width: addBookButtonRadius / 2,
    height: addBookButtonRadius / 2,
    borderRadius: addBookButtonRadius,
    fontSize: addBookButtonRadius * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPlus: {
    fontSize: addBookButtonRadius / 2,
    color: colors.white,
    backgroundColor: "transparent",
  },
});
