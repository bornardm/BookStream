// React and React Native components and hooks
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  View,
  FlatList,
  Button,
  TouchableHighlight,
  Modal,
  Keyboard,
} from "react-native";

// Third-party libraries/components
import { useNavigation } from "@react-navigation/native";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import i18next from "../localization/i18n";
import { useTranslation } from "react-i18next";

// Utility functions, constants, and other local imports
import { colors } from "../constants/Colors";
import {
  searchBooksByKeyword,
  fetchBookFromOpenLibrary,
  searchBooksAdvanced,
} from "../apiRequests";
import { getDefaultBookStatus } from "../constants/BookStatus";
import { use } from "i18next";

function AdvancedSearch({ setIsLoading, setBookPreviews, setFirstSearchDone }) {
  const { t } = useTranslation();
  const [isStretched, setIsStretched] = useState(false);
  const [title, setTitle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [publisher, setPublisher] = useState(null);

  const advancedSerch = async () => {
    if (title || author || publisher) {
      setIsLoading(true);
      setIsStretched(false);
      Keyboard.dismiss();
      result = await searchBooksAdvanced({ title, author, publisher });
      setBookPreviews(result);
      setIsLoading(false);
      setFirstSearchDone(true);
    }
  };

  return (
    <View style={styles.advancedSearchContainer}>
      <TouchableHighlight
        underlayColor="rgba(0, 0, 0, 0.05)"
        onPress={() => setIsStretched(!isStretched)}
        style={{ borderRadius: 5 }}
      >
        <View style={styles.advanceSearchHeader}>
          <Text>{t("components.keyWordSearch.advancedSearch.header")}</Text>
          <SimpleLineIcons
            name={isStretched ? "arrow-up" : "arrow-down"}
            size={20}
            color={colors.middleLightGrey}
            backgroundColor={"transparent"}
          />
        </View>
      </TouchableHighlight>
      {isStretched && (
        <View>
          <View style={styles.rowInput}>
            <Text>
              {t("components.keyWordSearch.advancedSearch.title") + " :"}
            </Text>
            <TextInput
              style={[
                styles.inputView,
                styles.textInput,
                styles.advancedSearchTextInput,
              ]}
              placeholder={t("components.keyWordSearch.advancedSearch.title")}
              value={title}
              onChangeText={(text) => setTitle(text)}
            />
          </View>
          <View style={styles.rowInput}>
            <Text>
              {t("components.keyWordSearch.advancedSearch.author") + " :"}
            </Text>
            <TextInput
              style={[
                styles.inputView,
                styles.textInput,
                styles.advancedSearchTextInput,
              ]}
              placeholder={t("components.keyWordSearch.advancedSearch.author")}
              onChangeText={(text) => setAuthor(text)}
              value={author}
            />
          </View>
          <View style={styles.rowInput}>
            <Text>
              {t("components.keyWordSearch.advancedSearch.publisher") + " :"}
            </Text>
            <TextInput
              style={[
                styles.inputView,
                styles.textInput,
                styles.advancedSearchTextInput,
              ]}
              placeholder={t(
                "components.keyWordSearch.advancedSearch.publisher"
              )}
              onChangeText={(text) => setPublisher(text)}
              value={publisher}
            />
          </View>
          <Button
            title={t("components.keyWordSearch.advancedSearch.searchButton")}
            onPress={advancedSerch}
          />
        </View>
      )}
    </View>
  );
}

export default function KeyWordBookSearch({
  visible,
  setIsVisible,
  addBookPreviewFunc,
  functions,
}) {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState(null);
  const [bookPreviews, setBookPreviews] = useState([]);
  const [firstSearchDone, setFirstSearchDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const search = async () => {
    if (searchText && searchText.length > 0) {
      setIsLoading(true);
      Keyboard.dismiss();
      result = await searchBooksByKeyword({ userQuery: searchText });
      setBookPreviews(result);
      setIsLoading(false);
      setFirstSearchDone(true);
    }
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

  const BookPreview = ({ infos }) => {
    const [imageURL, setImageURL] = useState(infos.coverURL); // To be aloead to change the image if there is an error on layout

    const handelBookPress = async () => {
      setIsLoading(true);
      const book = await fetchBookFromOpenLibrary(infos.isbn); // Fetch the book infos from the API
      if (book) {
        navigation.navigate("BookEditScreen", {
          book: book,
          onGoBack: onGoBackFromBookEditScreen,
        });
      } else {
        alert(t("screens.add.alerts.notFound"));
      }
      setIsLoading(false);
    };

    return (
      <TouchableOpacity onPress={handelBookPress}>
        <View style={styles.previewContainer}>
          <Image
            source={
              imageURL
                ? { uri: imageURL }
                : require("../../assets/no_image.jpg")
            }
            onError={() => setImageURL(null)}
            style={styles.previewImage}
          />
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle}>{infos.title}</Text>
            <Text>{infos.author}</Text>
            <Text>
              {infos.pages &&
                infos.pages + " " + t("components.keyWordSearch.pages")}
            </Text>
            <Text>{infos.firstPublishYear}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={() => {
        setIsVisible(false);
      }}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          setIsVisible(false);
        }}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.popup}>
              {isLoading ? (
                <ActivityIndicator
                  style={styles.activityIndicator}
                  size="large"
                  color="#0000ff"
                />
              ) : null}
              <View style={styles.inputView}>
                <TextInput
                  placeholder={t("components.keyWordSearch.inputPlaceholder")}
                  value={searchText}
                  onChangeText={(text) => setSearchText(text)}
                  onSubmitEditing={search}
                  style={styles.textInput}
                  placeholderTextColor={colors.placeholderTextColor}
                  maxLength={200}
                />
                <TouchableOpacity onPress={search}>
                  <EvilIcons
                    name="search"
                    size={35}
                    color={colors.textInputBorder}
                  />
                </TouchableOpacity>
              </View>
              <AdvancedSearch
                setIsLoading={setIsLoading}
                setBookPreviews={setBookPreviews}
                setFirstSearchDone={setFirstSearchDone}
              />
              {bookPreviews === null || bookPreviews.length === 0 ? (
                firstSearchDone && (
                  <Text style={{ alignSelf: "center", margin: 10 }}>
                    {t("components.keyWordSearch.noResults")}
                  </Text>
                )
              ) : (
                <FlatList
                  style={styles.flatList}
                  data={bookPreviews}
                  renderItem={({ item }) => <BookPreview infos={item} />}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  inputView: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 5,
    borderColor: colors.textInputBorder,
    borderWidth: 1,
  },
  textInput: {
    padding: 10,
    flex: 1,
  },
  previewContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "transparent",
    borderRadius: 10,
    margin: 5,
  },
  previewImage: {
    width: 70,
    height: 100,
    borderRadius: 5,
  },
  previewInfo: {
    marginLeft: 10,
    backgroundColor: "transparent",
    flex: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  advancedSearchContainer: {
    backgroundColor: colors.lightGrey,
    margin: 5,
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginVertical: 5,
  },

  advanceSearchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
  },
  rowInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  advancedSearchTextInput: {
    marginLeft: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: "90%",
    height: "85%",
    padding: 10,
    paddingVertical: 30,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  flatList: {
    width: "100%",
  },
  activityIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    zIndex: 1,
  },
});
