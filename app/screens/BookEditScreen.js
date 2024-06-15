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
import * as ImagePicker from "expo-image-picker";

const defaultBook = {
  title: null,
  author: null,
  publicationDate: null,
  publisher: null,
  pageNumber: null,
  isbn: null,
  summary: null,
  status: defaultStatus,
  borrowed: false,
  toExchange: false,
  rating: null,
  readingStartDate: null,
  readingEndDate: null,
  imageName: null,
  series: null,
  volume: null,
  comment: null,
  categories: null,
  language: null,
};

export default function BookEditScreen({ route }) {
  const [book, setBook] = useState(route.params?.book || defaultBook);
  const [aspectRatio, setAspectRatio] = useState(1); // Initialize aspect ratio to 1
  const [modalVisible, setModalVisible] = useState(false);
  const [tempoImageURI, setTempoImageURI] = useState(
    route.params?.book?.imageName ? `${coversDir}${book.imageName}` : null
  );

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
    const [date, setDate] = useState(new Date(defaultDate) || new Date());
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
                  console.log(selectedDate);
                  setDate(selectedDate);
                  setDateUpdated(true);
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
          onPress={() => {
            navigation.goBack();
            console.log("Save book");
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
    }
  };

  useEffect(() => {
    if (tempoImageURI) {
      Image.getSize(tempoImageURI, (width, height) => {
        setAspectRatio(width / height); // Update aspect ratio
      });
    }
  }, [tempoImageURI]); // Run effect when tempoImageURI changes

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
              tempoImageURI
                ? { uri: tempoImageURI }
                : require("../../assets/no_image.jpg")
            }
            style={[styles.cover, { aspectRatio: aspectRatio }]}
          />
        </TouchableWithoutFeedback>
        <View style={styles.row}>
          <Text>Title :</Text>
          <TextInput
            placeholder="Title"
            defaultValue={book.title}
            style={styles.textInput}
            placeholderTextColor={placeholderTextColor}
            maxLength={200}
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
            style={styles.textInput}
            defaultValue={book.author} //TODO change this
            placeholderTextColor={placeholderTextColor}
            maxLength={100}
          />
        </View>
        <View style={styles.row}>
          <Text>Summary :</Text>
          <TextInput
            placeholder="Summary"
            defaultValue={book.summary}
            multiline={true}
            style={[styles.textInput, styles.textInputMultiline]}
            placeholderTextColor={placeholderTextColor}
          />
        </View>
        <View style={styles.row}>
          <Text>Number of pages :</Text>
          <TextInput
            placeholder="Number of pages"
            defaultValue={book.pageNumber?.toString()}
            keyboardType="number-pad"
            style={styles.textInput}
            placeholderTextColor={placeholderTextColor}
            maxLength={20}
          />
        </View>
        <View style={styles.row}>
          <Text>Series :</Text>
          <TextInput
            placeholder="Series name "
            defaultValue={book.series}
            style={styles.textInput}
            placeholderTextColor={placeholderTextColor}
            maxLength={100}
          />
          <TextInput
            placeholder="Volume"
            defaultValue={book.volume?.toString()}
            keyboardType="number-pad"
            style={[styles.textInput, { flex: 0.3 }]}
            placeholderTextColor={placeholderTextColor}
            maxLength={20}
          />
        </View>
        <View style={styles.row}>
          <Text>Publisher :</Text>
          <TextInput
            placeholder="Publisher"
            defaultValue={book.publisher}
            style={styles.textInput}
            placeholderTextColor={placeholderTextColor}
            maxLength={100}
          />
        </View>
        <View style={styles.row}>
          <Text>Publication date :</Text>
          <DatePicker defaultDate={book.publicationDate} />
        </View>
        <View style={styles.row}>
          <Text>ISBN :</Text>
          <TextInput
            placeholder="ISBN"
            defaultValue={book.isbn?.toString()}
            keyboardType="number-pad"
            style={styles.textInput}
            placeholderTextColor={placeholderTextColor}
            maxLength={13}
          />
        </View>
        <View style={styles.row}>
          <Text>Language :</Text>
          <TextInput
            placeholder="Language"
            defaultValue={book.language}
            style={styles.textInput}
            placeholderTextColor={placeholderTextColor}
            maxLength={100}
          />
        </View>
        <View style={styles.row}>
          <Text>Categories :</Text>
          <TextInput
            placeholder="Category"
            defaultValue={book.categories} //TODO change this
            style={styles.textInput}
            placeholderTextColor={placeholderTextColor}
            maxLength={100}
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
