// React and React Native components and hooks
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import i18next from "../localization/i18n";
import { useTranslation } from "react-i18next";

// Utility functions, constants, and other local imports
import { colors } from "../constants/Colors";
import { defaultStatus } from "../constants/BookStatus";
import { isDigitsOnly } from "../utils";
import { fetchBookFromOpenLibrary } from "../apiRequests";

export default function AddScreen({ route, navigation }) {
  //------------------------ Variables and States ------------------------
  const { t } = useTranslation();
  const addBookPreviewFunc = route.params.addBookPreviewFunc;
  const functions = route.params.functions;
  const [searchText, setSearchText] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // for display loading spinner

  //------------------------ Functions ----------------------------------

  const searchBookByISBN = async (text) => {
    if ((text.length === 10 || text.length === 13) && isDigitsOnly(text)) {
      setIsLoading(true); // Start loading
      const book = await fetchBookFromOpenLibrary(text); //("9780140328721");
      if (book) {
        navigation.navigate("BookEditScreen", {
          book: book,
          onGoBack: onGoBackFromBookEditScreen,
        });
      } else {
        alert(t("screens.add.alerts.notFound"));
      }
      setIsLoading(false); // Stop loading regardless of the outcome
    } else {
      alert(t("screens.add.alerts.invalidISBN"));
    }
  };

  const onGoBackFromScannerScreen = async (isbn) => {
    setSearchText(isbn);
    await searchBookByISBN(isbn);
  };

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
      {isLoading ? (
        <ActivityIndicator
          style={styles.activityIndicator}
          size="large"
          color="#0000ff"
        />
      ) : null}
      <Text>{t("screens.add.title")}</Text>
      <View style={styles.search}>
        <View style={styles.inputView}>
          <EvilIcons name="search" size={35} color={colors.textInputBorder} />
          <TextInput
            placeholder={t("screens.add.inputPlaceholder")}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={async (event) => {
              await searchBookByISBN(event.nativeEvent.text);
            }}
            style={styles.textInput}
            placeholderTextColor={colors.placeholderTextColor}
            maxLength={200}
          />
        </View>
        <MaterialCommunityIcons.Button
          name="barcode-scan"
          style={styles.scanButton}
          color={colors.black}
          backgroundColor={colors.white}
          onPress={() => {
            navigation.navigate("ScannerScreen", {
              onGoBack: onGoBackFromScannerScreen,
            });
          }}
        />
      </View>
      <Button
        title={t("screens.add.buttons.addManually")}
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
    padding: 10,
  },
  activityIndicator: {
    position: "absolute",
    zIndex: 1,
  },
  scanButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 0,
    paddingLeft: 10,
    borderColor: colors.textInputBorder,
    borderWidth: 1,
  },
  search: {
    flexDirection: "row",
    marginVertical: 20,
  },
  inputView: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 5,
    borderColor: colors.textInputBorder,
    borderWidth: 1,
    marginRight: 10,
  },
  textInput: {
    padding: 10,
    flex: 1,
  },
});
