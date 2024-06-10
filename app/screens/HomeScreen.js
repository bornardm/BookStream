import React, { Suspense, useEffect } from "react";
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
import { fetchData } from "../requests";

export default function HomeScreen({ navigation }) {
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <Suspense fallback={<LoadindingView />}>
      <SQLiteProvider databaseName={dbName} useSuspense>
        <View style={styles.container}>
          <ScrollView style={styles.scrollView}>
            <BookPreview />
            <BookPreview />
            <BookPreview />
            <BookPreview />
            <BookPreview />
            <BookPreview />
            <BookPreview />
            <BookPreview />
            <BookPreview />
            <BookPreview />
            <BookPreview />
            <BookPreview />
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
