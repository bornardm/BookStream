// React and React Native components and hooks
import React, {
  useState,
  useEffect,
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
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";

// Utility functions, constants, and other local imports
import { addOrModifyBookDB } from "../requests";
import { colors } from "../constants/Colors";
import {
  coversDir,
  downloadImageFromInternetToCovers,
  deleteImageFromCovers,
} from "../setupDatabase";
import { defaultStatus } from "../constants/BookStatus";
import { isDigitsOnly } from "../utils";

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
  const [aspectRatio, setAspectRatio] = useState(1); // Initialize aspect ratio to 1
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState(
    book.imageName.value ? `${coversDir}${book.imageName.value}` : null
  ); // Local path of the local image
  const [newImageFormat, setNewImageFormat] = useState(null); // Format of the new image if it has been changed (null if not)
  const navigation = useNavigation();
  let bookIdAfterRequest = null;

  //------------------------ Functions ------------------------

  /**
   * Saves the changes made to the book.
   * @returns {boolean} Returns true if the book changes were saved successfully, false otherwise.
   */
  const saveBookChanges = async () => {
    // Check if all fields are valid
    const allValid = Object.values(book).every((field) => field.isValid);
    if (allValid) {
      let returnedId = null; //Id of the book in the DB after the request
      if (newImageFormat) {
        //A new image heve been selected
        returnedId = await addOrModifyBookDB({
          book: book,
          newImageURI: apiImageUrl || imageUri,
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

  //------------------------ Components ------------------------

  function BackArrow() {
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
                  : colors.placeholderTextColor,
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
              navigation.goBack();
              onGoBack({
                id: bookIdAfterRequest,
                title: book.title.value,
                author: book.author.value,
                imageName: book.imageName.value,
              });
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
          <Text>Title :</Text>
          <TextInput
            placeholder="Title"
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
          <Text>Author :</Text>
          <TextInput
            placeholder="Firstname Lastname"
            style={[
              styles.textInput,
              !book.author.isValid && styles.textInputNotValid,
            ]}
            defaultValue={book.author.value}
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
          <Text>Summary :</Text>
          <TextInput
            placeholder="Summary"
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
          <Text>Number of pages :</Text>
          <TextInput
            placeholder="Number of pages"
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
        <View style={styles.row}>
          <Text>Series :</Text>
          <TextInput
            placeholder="Series name "
            defaultValue={book.series.value}
            style={styles.textInput}
            placeholderTextColor={colors.placeholderTextColor}
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
          <Text>Publisher :</Text>
          <TextInput
            placeholder="Publisher"
            defaultValue={book.publisher.value}
            style={styles.textInput}
            placeholderTextColor={colors.placeholderTextColor}
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
          <Text>Language :</Text>
          <TextInput
            placeholder="Language"
            defaultValue={book.language.value}
            style={styles.textInput}
            placeholderTextColor={colors.placeholderTextColor}
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
            placeholderTextColor={colors.placeholderTextColor}
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
});
