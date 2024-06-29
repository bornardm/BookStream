// React and React Native components and hooks
import React, { useEffect, useState } from "react";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Third-party libraries/components
import EvilIcons from "react-native-vector-icons/EvilIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// Utility functions, constants, and other local imports
import { colors } from "../constants/Colors";
import { defaultStatus } from "../constants/BookStatus";
import { isDigitsOnly } from "../utils";
import { fetchBookFromOpenLibrary } from "../apiRequests";

export default function AddScreen({ route, navigation }) {
  //------------------------ Variables and States ------------------------
  const addBookPreviewFunc = route.params.addBookPreviewFunc;
  const functions = route.params.functions;
  const [searchText, setSearchText] = useState(null);

  //------------------------ Functions ----------------------------------

  const onGoBackFromBookEditScreen = ({ id, title, author, imageName }) => {
    navigation.goBack();
    console.log("Go back from BookEditScreen");
    const preview = {
      id: id,
      title: title,
      author: author,
      rating: null,
      status: defaultStatus,
      imageName: imageName,
    };
    console.log("PREVIEW : ", preview);
    addBookPreviewFunc(preview);
    navigation.navigate("BookScreen", {
      bookID: id,
      functions: functions, // pass the functions as a parameter
    });
  };

  return (
    <View style={styles.container}>
      <Text>Add Screen</Text>
      <MaterialCommunityIcons.Button
        name="barcode-scan"
        style={styles.scanButton}
        color={colors.black}
        backgroundColor={colors.white}
        onPress={() => {
          navigation.navigate("ScannerScreen", {
            onGoBack: setSearchText,
          });
        }}
      />
      <View style={styles.inputView}>
        <EvilIcons name="search" size={35} color={colors.textInputBorder} />
        <TextInput
          placeholder="Title, isbn, author..."
          value={searchText}
          onChangeText={setSearchText}
          onEndEditing={async (event) => {
            const text = event.nativeEvent.text;
            if (
              (text.length === 10 || text.length === 13) &&
              isDigitsOnly(text)
            ) {
              const book = await fetchBookFromOpenLibrary(
                event.nativeEvent.text
              ); //("9780140328721");
              if (book) {
                navigation.navigate("BookEditScreen", {
                  book: book,
                  onGoBack: onGoBackFromBookEditScreen,
                });
              } else {
                alert("Book not found");
              }
            } else {
              alert("ISBN not valid (10 or 13 digits)");
            }
          }}
          style={styles.textInput}
          placeholderTextColor={colors.placeholderTextColor}
          maxLength={200}
        />
      </View>
      <Button
        title="Add manually"
        onPress={() => {
          console.log("Add manually button pressed");
          navigation.navigate("BookEditScreen", {
            book: null,
            onGoBack: onGoBackFromBookEditScreen,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 0,
    paddingLeft: 10,
    borderColor: colors.textInputBorder,
    borderWidth: 1,
  },
  inputView: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 5,
    borderColor: colors.textInputBorder,
    borderWidth: 1,
    margin: 10,
  },
  textInput: {
    padding: 10,
    flex: 1,
  },
});
