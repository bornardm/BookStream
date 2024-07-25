// React and React Native components and hooks
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Third-party libraries/components
import EvilIcons from "react-native-vector-icons/EvilIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import i18next from "../localization/i18n";
import { useTranslation } from "react-i18next";

// Utility functions, constants, and other local imports
import { colors } from "../constants/Colors";
import { getDefaultBookStatus } from "../constants/BookStatus";
import { isDigitsOnly } from "../utils";
import { fetchBookFromOpenLibrary } from "../apiRequests";
import KeyWordBookSearch from "../components/KeyWordBookSearch";

export default function AddScreen({ route, navigation }) {
  //------------------------ Variables and States ------------------------

  const { t } = useTranslation();
  const addBookPreviewFunc = route.params.addBookPreviewFunc;
  const functions = route.params.functions;
  const [searchText, setSearchText] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // for display loading spinner
  const [keywordSearchVisible, setKeywordSearchVisible] = useState(false);
  const [keyWordSearchKey, setKeyWordSearchKey] = useState(0);

  //------------------------ Functions ----------------------------------

  const searchBookByISBN = async (text) => {
    if (
      text &&
      (text.length === 10 || text.length === 13) &&
      isDigitsOnly(text)
    ) {
      setIsLoading(true); // Start loading
      const book = await fetchBookFromOpenLibrary(text); // Fetch the book infos from the API
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
      status: getDefaultBookStatus(),
      imageName: imageName,
    };
    console.log("PREVIEW : ", preview);
    addBookPreviewFunc(preview);
    navigation.navigate("BookScreen", {
      bookID: id,
      functions: functions, // pass the functions as a parameter
    });
  };

  useEffect(() => {
    if (keywordSearchVisible) {
      setKeyWordSearchKey((prevKey) => prevKey + 1); // Increment the key to get a new value
    }
  }, [keywordSearchVisible]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator
          style={styles.activityIndicator}
          size="large"
          color="#0000ff"
        />
      ) : null}
      <Text style={styles.title}>{t("screens.add.title")}</Text>
      <View style={styles.search}>
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
        <View style={styles.inputView}>
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
          <TouchableOpacity
            onPress={async () => await searchBookByISBN(searchText)}
          >
            <EvilIcons
              name="search"
              size={35}
              color={colors.textInputBorder}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("BookEditScreen", {
              book: null,
              onGoBack: onGoBackFromBookEditScreen,
            });
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {t("screens.add.buttons.addManually")}{" "}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setKeywordSearchVisible(true);
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {t("screens.add.buttons.searchByKeyword")}
          </Text>
        </TouchableOpacity>
      </View>
      {keywordSearchVisible && (
        <KeyWordBookSearch
          visible={keywordSearchVisible}
          key={keyWordSearchKey}
          setIsVisible={setKeywordSearchVisible}
          addBookPreviewFunc={addBookPreviewFunc}
          functions={functions}
        />
      )}
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
    borderRadius: 20,
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
    borderRadius: 20,
    borderColor: colors.textInputBorder,
    borderWidth: 1,
    marginLeft: 10,
  },
  textInput: {
    padding: 10,
    flex: 1,
  },
  searchIcon: {
    paddingRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 25,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});
