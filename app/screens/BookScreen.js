import React, { useState, useEffect, Suspense } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Image,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { colors } from "../constants/Colors";
import { TenStarsTouchable } from "../components/Stars";
import { BookStatusSelector } from "../components/BookStatusSelector";
import DatePicker from "../components/DatePicker";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";
import { BOOK_STATUS } from "../constants/BookStatus";
import { fetchBookInfos, deleteBookDB } from "../requests";
import { SQLiteProvider } from "expo-sqlite/next";
import LoadingView from "../components/LoadingView";
import { dbName } from "../setupDatabase";
import { coversDir } from "../setupDatabase";
import * as FileSystem from "expo-file-system";

function InfoList(book) {
  const infoProps = [
    {
      icon: Feather,
      name: "calendar",
      text: new Date(book.publicationDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    },
    { icon: Ionicons, name: "business-outline", text: book.publisher },
    { icon: MaterialCommunityIcons, name: "barcode-scan", text: book.isbn },
    {
      icon: Feather,
      name: "book",
      text: book.pageNumber ? book.pageNumber + " pages" : null,
    },
    { icon: Ionicons, name: "language-outline", text: book.language },
  ];
  return (
    <View style={styles.infosView}>
      {infoProps.map(
        (info, index) =>
          info.text && (
            <View key={index} style={styles.infoRow}>
              <info.icon
                name={info.name}
                size={20}
                color={colors.secondary}
                alignSelf="flex-start"
                backgroundColor="transparent"
              />
              <Text style={styles.textInfos}>{info.text}</Text>
            </View>
          )
      )}
    </View>
  );
}
const imageMargin = 20;

export default function BookScreen({ route }) {
  const { bookID, functions } = route.params;
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 }); // to set the size of the imageView
  const [imageNameState, setImageNameState] = useState(null);
  const [book, setBook] = useState(null);
  const [bookLoaded, setBookLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1); // Initialize aspect ratio to 1

  //console.log("BookScreen", bookID);

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
            functions.updateBookPreviewFunc({
              id: book.id,
              title: book.title,
              author: book.author,
              rating: book.rating,
              status: book.status,
              imageName: book.imageName,
            });
          }}
        />
      </View>
    );
  }
  function EditButton() {
    const navigation = useNavigation();
    return (
      <View style={styles.editButton}>
        <MaterialIcons.Button
          name="edit"
          size={25}
          color={colors.lightGrey}
          backgroundColor={"transparent"}
          underlayColor={"transparent"}
          onPress={() =>
            navigation.navigate("BookEditScreen", {
              book: book,
              onGoBack: onGoBack,
            })
          }
        />
      </View>
    );
  }
  function Trash() {
    const navigation = useNavigation();
    return (
      <TouchableWithoutFeedback
        onPress={() =>
          Alert.alert(
            "Delete this book",
            "Would you like to remove this book from your library?",
            [
              { text: "NO" },
              {
                text: "YES",
                onPress: () => {
                  navigation.goBack();
                  deleteBookDB({ id: bookID, imageName: book.imageName });
                  functions.deleteBookPreviewFunc(bookID);
                },
              },
            ]
          )
        }
      >
        <View style={styles.trash}>
          <FontAwesome5
            name="trash"
            size={20}
            color={colors.darkGrey}
            backgroundColor={"transparent"}
          />
          <Text style={styles.textTrash}>Remove this book from my library</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
  function modifyStateBook({ rating, status }) {
    setBook({
      ...book,
      rating: rating === undefined ? book.rating : rating,
      status: status === undefined ? book.status : status,
    });
  }
  function onGoBack() {
    setBookLoaded(false);
  }
  useEffect(() => {
    console.log("BOOK :", book);
  }, [book]);

  useEffect(() => {
    const fetchBook = () => {
      const fetchedBook = fetchBookInfos({ id: bookID });
      //console.log("fetchedBook ", fetchedBook);
      setBook(fetchedBook);
      if (fetchedBook) {
        setBookLoaded(true);
      }
    };
    if (!bookLoaded) {
      //console.log("fetching book again");
      fetchBook();
    }
  }, [bookLoaded]);

  useEffect(() => {
    const fetchImageSize = async () => {
      try {
        if (book && book.imageName) {
          const fileInfo = await FileSystem.getInfoAsync(
            `${coversDir}${book.imageName}`
          );
          if (fileInfo.exists) {
            Image.getSize(
              `${coversDir}${book.imageName}`,
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
  }, [book]); // Run effect when imageName changes

  useEffect(() => {
    setImageNameState(book?.imageName);
  }, [book?.imageName]);

  if (!bookLoaded) {
    return <LoadingView />;
  }
  return (
    <Suspense fallback={<LoadingView />}>
      <SQLiteProvider databaseName={dbName} useSuspense>
        <View style={styles.container}>
          <ScrollView style={styles.ScrollView}>
            <View
              style={[
                styles.imagesView,
                { height: imageSize.height + 2 * imageMargin },
              ]}
            >
              <Image
                source={
                  imageNameState
                    ? { uri: `${coversDir}${imageNameState}` }
                    : require("../../assets/no_image.jpg")
                }
                blurRadius={3}
                style={styles.headerImage}
                onError={() => setImageNameState(null)}
              />
              <Image
                source={
                  imageNameState
                    ? { uri: `${coversDir}${imageNameState}` }
                    : require("../../assets/no_image.jpg")
                }
                style={[styles.cover, { aspectRatio: aspectRatio }]}
                onError={() => setImageNameState(null)}
                onLayout={(event) => {
                  const { width, height } = event.nativeEvent.layout;
                  setImageSize({ width, height });
                }}
              />
            </View>
            <View style={styles.infosView}>
              <Text style={styles.textTile}>{book.title}</Text>
              <Text style={styles.textAuthor}>{book.author}</Text>
              {book.series && (
                <Text style={styles.textSeries}>
                  {book.series}{" "}
                  {book.volume ? (
                    <Text style={styles.textVolume}>
                      (volume {book.volume})
                    </Text>
                  ) : null}
                </Text>
              )}
              <View style={styles.starsView}>
                <TenStarsTouchable
                  bookID={bookID}
                  rating={book.rating}
                  size={30}
                  updateStateBookFunc={modifyStateBook}
                />
              </View>
              <View style={styles.statusView}>
                <BookStatusSelector
                  bookID={bookID}
                  status={book.status}
                  borrowed={book.borrowed}
                  toExchange={book.toExchange}
                  updateStateBookFunc={modifyStateBook}
                />
              </View>
            </View>
            <View style={styles.horizontalLine} />
            <View style={styles.infosView}>
              <Text>Reading dates</Text>
              <DatePicker
                bookID={bookID}
                initialStartDate={book.readingStartDate}
                initialEndDate={book.readingEndDate}
                updateStateBookFunc={modifyStateBook}
              />
            </View>
            <View style={styles.horizontalLine} />
            <View style={styles.infosView}>
              <Text>{book.summary}</Text>
            </View>
            <View style={styles.horizontalLine} />
            <InfoList {...book} />
            <View style={styles.horizontalLine} />
            <View style={styles.infosView}>
              <Text>{book.categories}</Text>
            </View>
            <View style={styles.horizontalLine} />
            <View style={styles.infosView}>
              <Text>{book.comment}</Text>
            </View>
            <View style={styles.horizontalLine} />

            <Trash />
            <EditButton />
          </ScrollView>
          <BackArrow />
        </View>
      </SQLiteProvider>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
  },
  editButton: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  ScrollView: {
    width: "100%",
    backgroundColor: "transparent",
  },
  imagesView: {
    justifyContent: "flex-start",
    backgroundColor: "transparent",
  },
  headerImage: {
    width: "100%",
    height: 110,
  },
  cover: {
    width: "45%",
    borderRadius: 5,
    margin: imageMargin,
    alignSelf: "center",
    position: "absolute",
    top: 0,
  },
  infosView: {
    marginHorizontal: 15,
  },

  starsView: {
    alignSelf: "center",
    paddingVertical: 15,
  },
  statusView: {
    paddingBottom: 15,
  },
  horizontalLine: {
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    marginVertical: 4,
  },
  textTile: {
    fontSize: 20,
    fontWeight: "bold",
  },
  textAuthor: {
    fontSize: 16,
  },
  textSeries: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textVolume: {
    fontSize: 16,
    fontStyle: "normal",
  },

  textInfos: {
    marginLeft: 7,
    color: colors.secondary,
  },
  trash: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  textTrash: {
    color: colors.darkGrey,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
