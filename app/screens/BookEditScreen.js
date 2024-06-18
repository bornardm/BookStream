import React, { useState, useEffect, Suspense } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  ScrollView,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Touchable,
  Modal,
} from "react-native";
import { colors } from "../constants/Colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import Octicons from "react-native-vector-icons/Octicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";

import { useNavigation } from "@react-navigation/native";
import { defaultStatus } from "../constants/BookStatus";
import { coversDir } from "../setupDatabase";
import { addOrModifyBookDB } from "../requests";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const initBook = (initialBook) => {
  const defaultBook = {
    id: { value: null, isValid: true },
    title: { value: null, isValid: true },
    author: { value: null, isValid: true },
    publicationDate: { value: null, isValid: true },
    publisher: { value: null, isValid: true },
    pageNumber: { value: null, isValid: true },
    isbn: { value: null, isValid: true },
    summary: { value: null, isValid: true },
    imageName: { value: null, isValid: true },
    series: { value: null, isValid: true },
    volume: { value: null, isValid: true },
    comment: { value: null, isValid: true },
    categories: { value: null, isValid: true },
    language: { value: null, isValid: true },
  };

  if (initialBook) {
    for (const field in defaultBook) {
      if (initialBook.hasOwnProperty(field)) {
        defaultBook[field].value = initialBook[field];
      }
    }
  }

  return defaultBook;
};

export default function BookEditScreen({ route }) {
  const { onGoBack } = route.params;
  const [book, setBook] = useState(initBook(route.params?.book));
  const [aspectRatio, setAspectRatio] = useState(1); // Initialize aspect ratio to 1
  const [imageUriState, setImageUriState] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempoImageURI, setTempoImageURI] = useState(
    book.imageName.value ? `${coversDir}${book.imageName.value}` : null
  );
  const [newImageFormat, setNewImageFormat] = useState(null);
  let bookIdAfterRequest = null;

  async function saveBookChanges() {
    const allValid = Object.values(book).every((field) => field.isValid);
    if (allValid) {
      console.log(" Save book : All fields valid");
      let returnedId = null;
      if (newImageFormat) {
        //A new image heve been selected
        returnedId = await addOrModifyBookDB({
          book: book,
          newImageURI: tempoImageURI,
          newImageFormat: newImageFormat,
        });
      } else {
        // the image has not been changed
        returnedId = await addOrModifyBookDB({
          book: book,
          newImageURI: null,
          newImageFormat: null,
        });
      }
      if (returnedId) {
        bookIdAfterRequest = returnedId;
      }
      console.log("Book saved");
      return true;
    }
    return false;
  }
  function BackArrow() {
    const navigation = useNavigation();
    return (
      <View style={styles.backArrow}>
        <SimpleLineIcons.Button
          name="arrow-left"
          size={20}
          color={colors.lightGrey}
          alignSelf="flex-start"
          underlayColor={"transparent"}
          backgroundColor="transparent"
          onPress={() => {
            navigation.goBack();
            //TODO update book Scrren
          }}
        />
      </View>
    );
  }

  function DatePicker({ defaultDate }) {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(
      defaultDate ? new Date(defaultDate) : new Date()
    );
    const [dateUpdated, setDateUpdated] = useState(false);
    return (
      <TouchableWithoutFeedback onPress={() => setShowDatePicker(true)}>
        <View style={[styles.textInput, { flexDirection: "row" }]}>
          <Text
            style={{
              color:
                dateUpdated || defaultDate
                  ? colors.black
                  : placeholderTextColor,
            }}
          >
            {!dateUpdated && !defaultDate
              ? "Publication date"
              : date.toLocaleDateString("en-GB")}
          </Text>
          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={date}
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate && event.type === "set") {
                  setDate(selectedDate);
                  setDateUpdated(true);
                  updateBookField(
                    "publicationDate",
                    selectedDate.toISOString().split("T")[0]
                  );
                }
              }}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  }
  function HeaderBand() {
    const navigation = useNavigation();
    return (
      <View style={styles.headerBand}>
        <BackArrow />
        <Text>Edit Book</Text>
        <Octicons.Button
          name="check-circle-fill"
          size={20}
          color={colors.lightGrey}
          underlayColor={"transparent"}
          backgroundColor="transparent"
          onPress={async () => {
            const isSaved = await saveBookChanges();
            if (isSaved) {
              onGoBack({
                id: bookIdAfterRequest,
                title: book.title.value,
                author: book.author.value,
                imageName: book.imageName.value,
              });
              navigation.goBack();
            }
          }}
        />
      </View>
    );
  }

  function ModalPicker() {
    return (
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.popup}>
                <Text style={styles.title}>Change picture</Text>
                <View style={styles.centredViewPopup}>
                  <View style={styles.iconAndText}>
                    <MaterialCommunityIcons.Button
                      name="camera"
                      size={40}
                      color={colors.black}
                      backgroundColor={"transparent"}
                      underlayColor="rgba(0,0,0,0.1)"
                      onPress={() => {
                        console.log("Take a picture");
                        takePicture();
                        setModalVisible(false);
                      }}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                      }}
                    >
                      {"Take a\npicture"}
                    </Text>
                  </View>
                  <View style={styles.iconAndText}>
                    <MaterialIcons.Button
                      name="photo-library"
                      size={40}
                      color={colors.black}
                      backgroundColor={"transparent"}
                      underlayColor="rgba(0,0,0,0.1)"
                      onPress={() => {
                        console.log("Choose a picture");
                        pickImage();
                        setModalVisible(false);
                      }}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                      }}
                    >
                      {"Choose a\npicture"}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
  const pickImage = async () => {
    console.log("Pick image");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });

    console.log(result);
    if (!result.canceled) {
      setTempoImageURI(result.assets[0].uri);
      setNewImageFormat(result.assets[0].mimeType.split("/")[1]);
    }
  };

  const takePicture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.6,
    });

    console.log(result);
    if (!result.canceled) {
      setTempoImageURI(result.assets[0].uri);
      setNewImageFormat(result.assets[0].mimeType.split("/")[1]);
    }
  };
  const updateBookField = (field, value) => {
    if (value != book[field].value) {
      if (value === "") {
        value = null;
      }
      setBook((prevState) => ({
        ...prevState,
        [field]: { value: value, isValid: prevState[field].isValid },
      }));
    }
  };
  const updateBookFieldValidity = (field, isValid) => {
    setBook((prevState) => ({
      ...prevState,
      [field]: { value: prevState[field].value, isValid: isValid },
    }));
  };
  const checkInputValidity = (field, acceptanceCondition) => {
    if (!acceptanceCondition && book[field].isValid) {
      updateBookFieldValidity(field, false);
      console.log("Title is empty");
    } else if (acceptanceCondition && !book[field].isValid) {
      updateBookFieldValidity(field, true);
    }
  };

  const isDigitsOnly = (str) => /^\d*$/.test(str);

  useEffect(() => {
    console.log("Book updated", book);
  }, [book]);

  useEffect(() => {
    const fetchImageSize = async () => {
      try {
        if (tempoImageURI) {
          const fileInfo = await FileSystem.getInfoAsync(tempoImageURI);
          if (fileInfo.exists) {
            Image.getSize(
              tempoImageURI,
              (width, height) => {
                setAspectRatio(width / height); // Update aspect ratio
              },
              (error) => {
                console.error(`Couldn't get the image size: ${error}`);
              }
            );
          }
        }
      } catch (error) {
        console.error(`An error occurred: ${error}`);
      }
    };

    fetchImageSize();
  }, [tempoImageURI]); // Run effect when imageName changes

  useEffect(() => {
    setImageUriState(tempoImageURI);
  }, [tempoImageURI]);

  return (
    <ScrollView>
      <View style={styles.container}>
        <HeaderBand />
        <ModalPicker />
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <Image
            source={
              imageUriState
                ? { uri: imageUriState }
                : require("../../assets/no_image.jpg")
            }
            style={[styles.cover, { aspectRatio: aspectRatio }]}
            onError={() => setImageUriState(null)}
          />
        </TouchableWithoutFeedback>
        <View style={styles.row}>
          <Text>Title :</Text>
          <TextInput
            placeholder="Title"
            defaultValue={book.title.value}
            style={[
              styles.textInput,
              !book.title.isValid && styles.textInputNotValid,
            ]}
            placeholderTextColor={placeholderTextColor}
            maxLength={200}
            onChangeText={(text) => {
              checkInputValidity("title", text.trim() !== "");
            }}
            onEndEditing={(event) => {
              updateBookField("title", event.nativeEvent.text.trim());
            }}
          />
        </View>
        <View style={styles.row}>
          <Text>Author :</Text>
          <TextInput
            placeholder="Firstname"
            //TODO add default value
            style={styles.textInput}
            placeholderTextColor={placeholderTextColor}
            maxLength={100}
          />
          <TextInput
            placeholder="Lastname"
            style={[
              styles.textInput,
              !book.author.isValid && styles.textInputNotValid,
            ]}
            defaultValue={book.author.value} //TODO change this
            placeholderTextColor={placeholderTextColor}
            maxLength={100}
            onChangeText={(text) => {
              checkInputValidity("author", text.trim() !== "");
            }}
            onEndEditing={(event) => {
              updateBookField("author", event.nativeEvent.text.trim());
            }}
          />
        </View>
        <View style={styles.row}>
          <Text>Summary :</Text>
          <TextInput
            placeholder="Summary"
            defaultValue={book.summary.value}
            multiline={true}
            style={[styles.textInput, styles.textInputMultiline]}
            placeholderTextColor={placeholderTextColor}
            onChangeText={(text) => {
              updateBookField("summary", text);
            }}
          />
        </View>
        <View style={styles.row}>
          <Text>Number of pages :</Text>
          <TextInput
            placeholder="Number of pages"
            defaultValue={book.pageNumber.value?.toString()}
            keyboardType="number-pad"
            style={[
              styles.textInput,
              !book.pageNumber.isValid && styles.textInputNotValid,
            ]}
            placeholderTextColor={placeholderTextColor}
            maxLength={20}
            onChangeText={(text) => {
              checkInputValidity("pageNumber", isDigitsOnly(text.trim()));
            }}
            onEndEditing={(event) => {
              if (book.pageNumber.isValid) {
                const pageNumber = parseInt(event.nativeEvent.text.trim());
                updateBookField(
                  "pageNumber",
                  isNaN(pageNumber) ? null : pageNumber
                );
              }
            }}
          />
        </View>
        <View style={styles.row}>
          <Text>Series :</Text>
          <TextInput
            placeholder="Series name "
            defaultValue={book.series.value}
            style={styles.textInput}
            placeholderTextColor={placeholderTextColor}
            maxLength={100}
            onEndEditing={(event) => {
              updateBookField("series", event.nativeEvent.text.trim());
            }}
          />
          <TextInput
            placeholder="Volume"
            defaultValue={book.volume.value?.toString()}
            keyboardType="number-pad"
            style={[
              styles.textInput,
              { flex: 0.3 },
              !book.volume.isValid && styles.textInputNotValid,
            ]}
            placeholderTextColor={placeholderTextColor}
            maxLength={20}
            onChangeText={(text) => {
              checkInputValidity("volume", isDigitsOnly(text.trim()));
            }}
            onEndEditing={(event) => {
              if (book.volume.isValid) {
                const volume = parseInt(event.nativeEvent.text.trim());
                updateBookField("volume", isNaN(volume) ? null : volume);
              }
            }}
          />
        </View>
        <View style={styles.row}>
          <Text>Publisher :</Text>
          <TextInput
            placeholder="Publisher"
            defaultValue={book.publisher.value}
            style={styles.textInput}
            placeholderTextColor={placeholderTextColor}
            maxLength={100}
            onEndEditing={(event) => {
              updateBookField("publisher", event.nativeEvent.text.trim());
            }}
          />
        </View>
        <View style={styles.row}>
          <Text>Publication date :</Text>
          <DatePicker defaultDate={book.publicationDate.value} />
        </View>
        <View style={styles.row}>
          <Text>ISBN :</Text>
          <TextInput
            placeholder="ISBN"
            defaultValue={book.isbn.value?.toString()}
            keyboardType="number-pad"
            style={[
              styles.textInput,
              !book.isbn.isValid && styles.textInputNotValid,
            ]}
            placeholderTextColor={placeholderTextColor}
            maxLength={13}
            onChangeText={(text) => {
              text = text.trim();
              checkInputValidity(
                "isbn",
                isDigitsOnly(text) &&
                  (text.length === 13 ||
                    text.length === 0 ||
                    text.length === 10)
              );
            }}
            onEndEditing={(event) => {
              if (book.isbn.isValid) {
                const isbn = parseInt(event.nativeEvent.text.trim());
                updateBookField("isbn", isNaN(isbn) ? null : isbn);
              }
            }}
          />
        </View>
        <View style={styles.row}>
          <Text>Language :</Text>
          <TextInput
            placeholder="Language"
            defaultValue={book.language.value}
            style={styles.textInput}
            placeholderTextColor={placeholderTextColor}
            maxLength={100}
            onEndEditing={(event) => {
              updateBookField("language", event.nativeEvent.text.trim());
            }}
          />
        </View>
        <View style={styles.row}>
          <Text>Categories :</Text>
          <TextInput
            placeholder="Category"
            defaultValue={book.categories.value} //TODO change this
            style={styles.textInput}
            placeholderTextColor={placeholderTextColor}
            maxLength={100}
            onEndEditing={(event) => {
              updateBookField("categories", event.nativeEvent.text.trim());
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
const placeholderTextColor = colors.middleLightGrey;
const styles = StyleSheet.create({
  container: {},
  headerBand: {
    backgroundColor: colors.secondary,
    marginBottom: 10,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cover: {
    width: "45%",
    borderRadius: 5,
    alignSelf: "center",
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 10,
  },
  textInput: {
    height: 40,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    margin: 10,
    flex: 1,
  },
  textInputMultiline: {
    height: 200,
    textAlignVertical: "top",
  },
  textInputNotValid: {
    borderColor: "red",
    borderWidth: 2,
    backgroundColor: "rgba(255,0,0,0.1)",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: "80%",
    padding: 10,
    paddingVertical: 30,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-around",
  },
  centredViewPopup: {
    flexDirection: "row",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  iconAndText: {
    alignItems: "center",
    flex: 1,
  },
});
