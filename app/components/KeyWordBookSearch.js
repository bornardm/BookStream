// React and React Native components and hooks
import React, { useEffect, useState } from "react";
import {
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View,
  FlatList,
} from "react-native";

// Third-party libraries/components
import { useNavigation } from "@react-navigation/native";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import i18next from "../localization/i18n";
import { useTranslation } from "react-i18next";

// Utility functions, constants, and other local imports
import { colors } from "../constants/Colors";
import { searchBooksByKeyword, fetchBookFromOpenLibrary } from "../apiRequests";
import { getDefaultBookStatus } from "../constants/BookStatus";

export default function KeyWordBookSearch({
  setIsLoading,
  addBookPreviewFunc,
  functions,
}) {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState(null);
  const [bookPreviews, setBookPreviews] = useState([]);
  const { t } = useTranslation();

  const search = async () => {
    if (searchText && searchText.length > 0) {
      setIsLoading(true);
      result = await searchBooksByKeyword({ userQuery: searchText });
      if (result) {
        setBookPreviews(result);
      }
      setIsLoading(false);
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
    <View style={styles.container}>
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
          <EvilIcons name="search" size={35} color={colors.textInputBorder} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={bookPreviews}
        renderItem={({ item }) => <BookPreview infos={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  inputView: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 5,
    borderColor: colors.textInputBorder,
    borderWidth: 1,
    marginLeft: 10,
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
});
