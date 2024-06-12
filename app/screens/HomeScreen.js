import React, { Suspense, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from "react-native";
import { SQLiteProvider } from "expo-sqlite/next";
import { colors } from "../constants/Colors";
import Icon from "react-native-vector-icons/Entypo";
import BookPreview from "../components/BookPreview";
import LoadindingView from "../components/LoadingView";
import { dbName } from "../setupDatabase";
import { fetchBookPreview } from "../requests";

export default function HomeScreen({ navigation }) {
  const [allBookPreview, setAllBookPreview] = useState(null);
  const [previewsLoaded, setPreviewsLoaded] = useState(false);

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
  useEffect(() => {
    const fetchPreviews = async () => {
      const fetchedPreviews = await fetchBookPreview();
      //console.log("All previews : ", fetchedPreviews);
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
                  imagePath={book.imagePath}
                  functions={{
                    updateBookPreviewFunc: updateBookPreview,
                    deleteBookPreviewFunc: deleteBookPreview,
                  }}
                />
              ))}
          </ScrollView>
          <View style={styles.addBook}>
            <TouchableWithoutFeedback
              onPress={() => console.log("Add book button pressed")}
            >
              <Icon name="plus" style={styles.iconPlus} />
            </TouchableWithoutFeedback>
          </View>
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
  scrollView: {
    width: "100%",
    backgroundColor: "transparent",
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
