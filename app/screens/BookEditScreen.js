// React and React Native components and hooks
import React, {
  useState,
  useEffect,
  useMemo,
  Suspense,
  useCallback,
  useRef,
} from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

// Third-party libraries/components
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Octicons from "react-native-vector-icons/Octicons";
import Entypo from "react-native-vector-icons/Entypo";
import { ScrollView as VirtualizedScrollView } from "react-native-virtualized-view";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import i18next from "../localization/i18n";
import { useTranslation } from "react-i18next";

// Utility functions, constants, and other local imports
import { addOrModifyBookDB, getDistinctDB } from "../requests";
import { getDefaultBookStatus } from "../constants/BookStatus";
import { colors } from "../constants/Colors";
import {
  coversDir,
  downloadImageFromInternetToCovers,
  deleteImageFromCovers,
} from "../setupDatabase";
import { isDigitsOnly } from "../utils";
import { FlatList } from "react-native-gesture-handler";
import TextInputWithSuggestions from "../components/TextInputWithSuggestions";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { t, use } from "i18next";

/**
 * Initializes a book object with default values and optionally copies values from an initial book object.
 *
 * @param {Object} initialBook - The initial book object to copy values from (optional).
 * @returns {Object} - The initialized book object.
 */
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
    status: { value: getDefaultBookStatus(), isValid: true },
  };

  // Copy values from initial book to default book
  if (initialBook) {
    for (const field in defaultBook) {
      if (initialBook.hasOwnProperty(field)) {
        defaultBook[field].value = initialBook[field];
      }
    }
  }

  //update validity for title and Author that can't be empty
  if (!defaultBook.title.value) {
    defaultBook.title.isValid = false;
  }
  if (!defaultBook.author.value) {
    defaultBook.author.isValid = false;
  }

  return defaultBook;
};

export default function BookEditScreen({ route }) {
  //------------------------ Variables and States------------------------
  const { onGoBack } = route.params;
  const [apiImageUrl, setApiImageUrl] = useState(
    route.params?.book?.imageInternetURL
  ); //this variable is first initialized with the image URL from the internet and after the image is downloaded, it is set to the local path
  const apiImageUrlRef = useRef(apiImageUrl); //Reference to the apiImageUrl
  const [layoutImagePath, setLayoutImagePath] = useState(null); // Path to the image which is displayed (different from apiImageUrl to handel image layout errror whithout change unintentionally the db)
  const [book, setBook] = useState(initBook(route.params?.book));
  const [categoriesList, setCategoriesList] = useState([""]);
  const [aspectRatio, setAspectRatio] = useState(1); // Initialize aspect ratio to 1
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState(
    book.imageName.value ? `${coversDir}${book.imageName.value}` : null
  ); // Local path of the local image
  const [newImageFormat, setNewImageFormat] = useState(null); // Format of the new image if it has been changed (null if not)
  const navigation = useNavigation();
  let bookIdAfterRequest = null;

  // Suggestions for the TextInputWithSuggestions components (get from the DB)
  const authorSuggestions = useMemo(
    () => getDistinctDB({ field: "author" }),
    []
  );
  const publisherSuggestions = useMemo(
    () => getDistinctDB({ field: "publisher" }),
    []
  );
  const seriesSuggestions = useMemo(
    () => getDistinctDB({ field: "series" }),
    []
  );
  const languageSuggestions = useMemo(
    () => getDistinctDB({ field: "language" }),
    []
  );
  const categoriesSuggestions = useMemo(() => extractCategories(), []);

  //------------------------ Functions ------------------------

  /**
   * Extracts and returns all unique categories from the database.
   *
   * @returns {string[]} An array of unique categories.
   */
  function extractCategories() {
    let allCategories = [];
    const allCategoriesLists = getDistinctDB({ field: "categories" });
    allCategoriesLists.forEach((list) => {
      list.split("#").forEach((category) => {
        if (!(category in allCategories)) {
          allCategories.push(category);
        }
      });
    });
    return allCategories;
  }

  /**
   * Saves the changes made to the book.
   * @returns {boolean} Returns true if the book changes were saved successfully, false otherwise.
   */
  const saveBookChanges = async () => {
    // Check if all fields are valid
    const allValid = Object.values(book).every((field) => field.isValid);

    if (allValid) {
      let returnedId = null; //Id of the book in the DB after the request
      let bookObject = book;

      //Save categories :
      const categoriesString = categoriesList
        .filter((category) => category !== "")
        .join("#");
      setBook((prevState) => ({
        ...prevState,
        categories: {
          value: categoriesString,
          isValid: prevState.categories.isValid,
        },
      }));
      bookObject.categories.value =
        categoriesString === "" ? null : categoriesString;

      if (newImageFormat) {
        //A new image heve been selected
        returnedId = await addOrModifyBookDB({
          book: bookObject,
          newImageURI: apiImageUrl || imageUri,
          newImageFormat: newImageFormat,
        });
      } else {
        // the image has not been changed
        returnedId = await addOrModifyBookDB({
          book: bookObject,
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
  };

  /**
   * Function to pick an image from the image library.
   * @returns {Promise<void>} A promise that resolves when the image is picked and the image states are updated..
   */
  const pickImage = async () => {
    //console.log("Pick image");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setNewImageFormat(result.assets[0].mimeType.split("/")[1]);
      reinitializeApiImage();
    }
  };

  /**
   * Takes a picture using the device's camera.
   * @returns {Promise<void>} A promise that resolves once the picture is taken and the image states are updated.
   */
  const takePicture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.6,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setNewImageFormat(result.assets[0].mimeType.split("/")[1]);
      reinitializeApiImage();
    }
  };

  /**
   * Updates the specified field of the book with the given value.
   *
   * @param {string} field - The field to update.
   * @param {any} value - The new value for the field.
   */
  const updateBookField = (field, value) => {
    if (value !== book[field].value) {
      if (value === "") {
        value = null;
      }
      setBook((prevState) => ({
        ...prevState,
        [field]: { value: value, isValid: prevState[field].isValid },
      }));
    }
  };

  /**
   * Updates the validity of a specific field in the book object.
   *
   * @param {string} field - The field to update the validity for.
   * @param {boolean} isValid - The new validity value for the field.
   */
  const updateBookFieldValidity = (field, isValid) => {
    setBook((prevState) => ({
      ...prevState,
      [field]: { value: prevState[field].value, isValid: isValid },
    }));
  };

  /**
   * Checks an dupdate the validity a book field based on the acceptance condition.
   *
   * @param {string} field - The name of the book field to check.
   * @param {boolean} acceptanceCondition - The condition for validate the input field's value.
   */
  const checkInputValidity = (field, acceptanceCondition) => {
    if (!acceptanceCondition && book[field].isValid) {
      updateBookFieldValidity(field, false);
    } else if (acceptanceCondition && !book[field].isValid) {
      updateBookFieldValidity(field, true);
    }
  };

  /**
   * Reinitializes the API image by deleting the image from covers and resetting the API image URL.
   */
  const reinitializeApiImage = () => {
    // Use the ref's current value to get the latest apiImageUrl
    const currentApiImageUrl = apiImageUrlRef.current;
    if (currentApiImageUrl) {
      console.log("Reinitialize API image, apiImageUrl=", currentApiImageUrl);
      deleteImageFromCovers(currentApiImageUrl.split("/").pop());
      setApiImageUrl(null);
      // Update the ref
      apiImageUrlRef.current = null;
    }
  };

  //------------------------ UseEffects ------------------------

  /**
   * Download the image from the internet to the local storage when the screen is loaded.
   * Run only once when the screen is loaded.
   */
  useEffect(() => {
    const downloadImage = async () => {
      if (apiImageUrl) {
        const newImagePath = await downloadImageFromInternetToCovers(
          apiImageUrl,
          "jpg"
        );
        setApiImageUrl(newImagePath);
        setNewImageFormat("jpg");
        // Update the ref
        apiImageUrlRef.current = newImagePath;
      }
    };
    downloadImage();

    // Cleanup function to be called on component unmount
    return () => {
      reinitializeApiImage();
    };
  }, []);

  // useEffect(() => {
  //   console.log("Book updated", book);
  // }, [book]);

  /**
   * Get the image size and update the aspect ratio when the (local or api) image URI changes.
   */
  useEffect(() => {
    const fetchImageSize = async () => {
      try {
        const url =
          apiImageUrl && !apiImageUrl.startsWith("http")
            ? apiImageUrl
            : imageUri;
        if (url) {
          const fileInfo = await FileSystem.getInfoAsync(url);
          if (fileInfo.exists) {
            Image.getSize(
              url,
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
        console.error(`An error occurred while fetching image size: ${error}`);
      }
    };
    fetchImageSize();
  }, [imageUri, apiImageUrl]);

  useEffect(() => {
    setLayoutImagePath(apiImageUrl || imageUri);
  }, [apiImageUrl, imageUri]);

  /**
   * Update the categories list when the book's categories change.
   */
  useEffect(() => {
    let categories = book?.categories?.value;

    if (categories) {
      setCategoriesList(categories.split("#"));
    }
  }, [book?.categories?.value]);

  //------------------------ Components ------------------------

  function BackArrow() {
    return (
      <TouchableOpacity
        style={[styles.headerButton, styles.backArrow]}
        onPress={() => {
          navigation.goBack();
        }}
      >
        <SimpleLineIcons
          name="arrow-left"
          size={20}
          color={colors.lightGrey}
          alignSelf="flex-start"
        />
      </TouchableOpacity>
    );
  }

  function DatePicker({ defaultDate }) {
    const { t } = useTranslation();
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
                  : colors.placeholderTextColor,
            }}
          >
            {!dateUpdated && !defaultDate
              ? t("screens.bookEdit.inputTitle.publicationDate")
              : date.toLocaleDateString(t("dateFormat"))}
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
    const { t } = useTranslation();
    return (
      <View style={styles.headerBand}>
        <BackArrow />
        <Text style={styles.screenTitle}>{t("screens.bookEdit.title")}</Text>
        <TouchableOpacity
          style={[styles.headerButton, styles.checkButton]}
          onPress={async () => {
            const isSaved = await saveBookChanges();
            if (isSaved) {
              navigation.goBack();
              onGoBack({
                id: bookIdAfterRequest,
                title: book.title.value,
                author: book.author.value,
                imageName: book.imageName.value,
              });
            }
          }}
        >
          <Octicons
            name="check-circle-fill"
            size={25}
            color={colors.lightGrey}
            backgroundColor="transparent"
          />
        </TouchableOpacity>
      </View>
    );
  }

  function ModalPicker() {
    const { t } = useTranslation();
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
                <Text style={styles.title}>
                  {t("screens.bookEdit.modal.title")}
                </Text>
                <View style={styles.centredViewPopup}>
                  <View style={styles.iconAndText}>
                    <MaterialCommunityIcons.Button
                      name="camera"
                      size={40}
                      color={colors.black}
                      backgroundColor={"transparent"}
                      underlayColor={colors.underlayColor}
                      onPress={() => {
                        takePicture();
                        setModalVisible(false);
                      }}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                      }}
                    >
                      {t("screens.bookEdit.modal.takePicture")}
                    </Text>
                  </View>
                  <View style={styles.iconAndText}>
                    <MaterialIcons.Button
                      name="photo-library"
                      size={40}
                      color={colors.black}
                      backgroundColor={"transparent"}
                      underlayColor={colors.underlayColor}
                      onPress={() => {
                        pickImage();
                        setModalVisible(false);
                      }}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                      }}
                    >
                      {t("screens.bookEdit.modal.choosePicture")}
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

  function CategoryInput({ index }) {
    return (
      <View style={{ flex: 1 }}>
        <TextInputWithSuggestions
          suggestionsArrray={categoriesSuggestions}
          textInputStyle={styles.textInput}
          defaultValue={categoriesList[index]}
          placeholder={t("screens.bookEdit.inputPlaceholder.category")}
          placeholderTextColor={colors.placeholderTextColor}
          maxLength={100}
          onEndEditing={(event) => {
            const updatedCategories = [...categoriesList];
            updatedCategories[index] = event.nativeEvent.text
              .trim()
              .replace(/#/g, ""); // ensure that the category does not contain the separator character
            setCategoriesList(updatedCategories);
          }}
        />
        <TouchableOpacity
          onPress={() => {
            if (index === 0) {
              //Add a new category
              setCategoriesList([...categoriesList, ""]);
            } else {
              //Remove the category
              const updatedCategories = [...categoriesList];
              updatedCategories.splice(index, 1);
              setCategoriesList(updatedCategories);
            }
          }}
          underlayColor={colors.underlayColor}
          style={styles.categoryAddIcon}
        >
          <Entypo
            name={index === 0 ? "plus" : "minus"}
            size={30}
            color={colors.middleLightGrey}
            backgroundColor="transparent"
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView nestedScrollEnabled={true}>
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
              layoutImagePath
                ? { uri: layoutImagePath }
                : require("../../assets/no_image.jpg")
            }
            style={[styles.cover, { aspectRatio: aspectRatio }]}
            onError={() => {
              setLayoutImagePath(null);
            }} //This is why we use differnece state for the layout image
          />
        </TouchableWithoutFeedback>
        <View style={styles.row}>
          <Text>{t("screens.bookEdit.inputTitle.title")} :</Text>
          <TextInput
            placeholder={t("screens.bookEdit.inputTitle.title")}
            defaultValue={book.title.value}
            style={[
              styles.textInput,
              !book.title.isValid && styles.textInputNotValid,
            ]}
            placeholderTextColor={colors.placeholderTextColor}
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
          <Text style={{ alignSelf: "flex-start", marginTop: 20 }}>
            {t("screens.bookEdit.inputTitle.author")} :
          </Text>
          <TextInputWithSuggestions
            suggestionsArrray={authorSuggestions}
            textInputStyle={[
              styles.textInput,
              !book.author.isValid && styles.textInputNotValid,
            ]}
            defaultValue={book.author.value}
            placeholder={t("screens.bookEdit.inputPlaceholder.author")}
            placeholderTextColor={colors.placeholderTextColor}
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
          <Text>{t("screens.bookEdit.inputTitle.summary")} :</Text>
          <TextInput
            placeholder={t("screens.bookEdit.inputTitle.summary")}
            defaultValue={book.summary.value}
            multiline={true}
            style={[styles.textInput, styles.textInputMultiline]}
            placeholderTextColor={colors.placeholderTextColor}
            onChangeText={(text) => {
              updateBookField("summary", text);
            }}
          />
        </View>
        <View style={styles.row}>
          <Text>{t("screens.bookEdit.inputTitle.numberOfPages")} :</Text>
          <TextInput
            placeholder={t("screens.bookEdit.inputTitle.numberOfPages")}
            defaultValue={book.pageNumber.value?.toString()}
            keyboardType="number-pad"
            style={[
              styles.textInput,
              !book.pageNumber.isValid && styles.textInputNotValid,
            ]}
            placeholderTextColor={colors.placeholderTextColor}
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
        <View style={[styles.row, { alignItems: "flex-start" }]}>
          <Text style={styles.alignWithInputSuggestions}>
            {t("screens.bookEdit.inputTitle.series")} :
          </Text>
          <TextInputWithSuggestions
            suggestionsArrray={seriesSuggestions}
            placeholder={t("screens.bookEdit.inputPlaceholder.series")}
            defaultValue={book.series.value}
            textInputStyle={styles.textInput}
            placeholderTextColor={colors.placeholderTextColor}
            maxLength={100}
            onEndEditing={(event) => {
              updateBookField("series", event.nativeEvent.text.trim());
            }}
          />
          <TextInput
            placeholder={t("screens.bookEdit.inputTitle.volume")}
            defaultValue={book.volume.value?.toString()}
            keyboardType="number-pad"
            style={[
              styles.textInput,
              { flex: 0.3 },
              !book.volume.isValid && styles.textInputNotValid,
            ]}
            placeholderTextColor={colors.placeholderTextColor}
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
          <Text style={styles.alignWithInputSuggestions}>
            {t("screens.bookEdit.inputTitle.publisher")} :
          </Text>
          <TextInputWithSuggestions
            suggestionsArrray={publisherSuggestions}
            placeholder={t("screens.bookEdit.inputTitle.publisher")}
            defaultValue={book.publisher.value}
            textInputStyle={styles.textInput}
            placeholderTextColor={colors.placeholderTextColor}
            maxLength={100}
            onEndEditing={(event) => {
              updateBookField("publisher", event.nativeEvent.text.trim());
            }}
          />
        </View>
        <View style={styles.row}>
          <Text>{t("screens.bookEdit.inputTitle.publicationDate")} :</Text>
          <DatePicker defaultDate={book.publicationDate.value} />
        </View>
        <View style={styles.row}>
          <Text>{t("screens.bookEdit.inputTitle.isbn")} :</Text>
          <TextInput
            placeholder={t("screens.bookEdit.inputTitle.isbn")}
            defaultValue={book.isbn.value?.toString()}
            keyboardType="number-pad"
            style={[
              styles.textInput,
              !book.isbn.isValid && styles.textInputNotValid,
            ]}
            placeholderTextColor={colors.placeholderTextColor}
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
          <Text style={styles.alignWithInputSuggestions}>
            {t("screens.bookEdit.inputTitle.language")} :
          </Text>
          <TextInputWithSuggestions
            suggestionsArrray={languageSuggestions}
            placeholder={t("screens.bookEdit.inputTitle.language")}
            defaultValue={book.language.value}
            textInputStyle={styles.textInput}
            placeholderTextColor={colors.placeholderTextColor}
            maxLength={100}
            onEndEditing={(event) => {
              updateBookField("language", event.nativeEvent.text.trim());
            }}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.alignWithInputSuggestions}>
            {t("screens.bookEdit.inputTitle.categories")} :
          </Text>
          <View style={{ flexDirection: "column", flex: 1 }}>
            {categoriesList.map((category, index) => (
              <CategoryInput key={index} index={index} />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {},
  headerBand: {
    marginBottom: 10,
    marginTop: 5,
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
    borderColor: colors.textInputBorder,
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
  alignWithInputSuggestions: {
    alignSelf: "flex-start",
    marginTop: 20,
  },
  categoryAddIcon: { position: "absolute", right: 10, top: 15 },
  backArrow: {
    backgroundColor: colors.secondary,
    borderBottomEndRadius: 25,
    borderTopEndRadius: 25,
  },
  headerButton: {
    backgroundColor: colors.secondary,
    padding: 7,
    height: "100%",
    width: 45,
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  checkButton: {
    borderBottomStartRadius: 25,
    borderTopStartRadius: 25,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
});
