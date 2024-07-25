// React and React Native components and hooks
import React, { useEffect, useState, Suspense } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Third-party libraries/components
import { useNavigation } from "@react-navigation/native";
import DatePicker from "../components/DatePicker";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import Octicons from "react-native-vector-icons/Octicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { SQLiteProvider } from "expo-sqlite/next";
import * as FileSystem from "expo-file-system";
import i18next from "../localization/i18n";
import { useTranslation } from "react-i18next";

// Utility functions, constants, and other local imports
import { BOOK_STATUS } from "../constants/BookStatus";
import { colors } from "../constants/Colors";
import { coversDir, dbName } from "../setupDatabase";
import { deleteBookDB, fetchBookInfos, updateBookCommentDB } from "../requests";
import LoadingView from "../components/LoadingView";
import { BookStatusSelector } from "../components/BookStatusSelector";
import { TenStarsTouchable } from "../components/Stars";

/**
 * Renders a list of book information.
 * Display if not null : publicationDate, Publisher, ISBN, pageNumber, language.
 *
 * @param {Object} book - The book object containing information.
 * @returns {JSX.Element} - The rendered component.
 */
function InfoList(book) {
  const infoProps = [
    {
      icon: Feather,
      name: "calendar",
      text: book.publicationDate
        ? new Date(book.publicationDate).toLocaleDateString(
            i18next.t("dateFormat"),
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          )
        : null,
    },
    { icon: Ionicons, name: "business-outline", text: book.publisher },
    { icon: MaterialCommunityIcons, name: "barcode-scan", text: book.isbn },
    {
      icon: Feather,
      name: "book",
      text: book.pageNumber
        ? book.pageNumber + " " + i18next.t("screens.book.pages")
        : null,
    },
    { icon: Ionicons, name: "language-outline", text: book.language },
  ];
  //Check if there is at least one info to display
  const displayInfo = infoProps.some((info) => info.text);
  if (!displayInfo) {
    return null;
  }
  return (
    <>
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
      <View style={styles.horizontalLine} />
    </>
  );
}

const imageMargin = 20;

export default function BookScreen({ route }) {
  //------------------------ Variables and States------------------------
  const { bookID, functions } = route.params;
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 }); // to set the size of the imageView
  const [imageNameState, setImageNameState] = useState(null);
  const [book, setBook] = useState(null);
  const [bookLoaded, setBookLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1); // Initialize aspect ratio to 1
  const { t } = useTranslation();

  //------------------------ Functions ----------------------------------

  function modifyStateBook({ rating, status, comment }) {
    setBook({
      ...book,
      rating: rating === undefined ? book.rating : rating,
      status: status === undefined ? book.status : status,
      comment: comment === undefined ? book.comment : comment,
    });
  }

  function onGoBack() {
    setBookLoaded(false);
  }

  //------------------------ UseEffects ---------------------------------

  // useEffect(() => {
  //   console.log("BOOK :", book);
  // }, [book]);

  useEffect(() => {
    /**
     * Fetches book information based on the provided book ID.
     */
    const fetchBook = () => {
      const fetchedBook = fetchBookInfos({ id: bookID });
      setBook(fetchedBook);
      if (fetchedBook) {
        setBookLoaded(true);
      }
    };
    if (!bookLoaded) {
      fetchBook();
    }
  }, [bookLoaded]);

  useEffect(() => {
    /**
     * Fetches the size of the image associated with the book and updates the aspect ratio.
     */
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

  //------------------------ Componnents --------------------------------

  function BackArrow() {
    const navigation = useNavigation();
    return (
      <TouchableOpacity
        style={[styles.headerButton, styles.backArrow]}
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
      >
        <SimpleLineIcons name="arrow-left" size={20} color={colors.lightGrey} />
      </TouchableOpacity>
    );
  }
  function EditButton() {
    const navigation = useNavigation();
    return (
      <TouchableOpacity
        style={[styles.headerButton, styles.editButton]}
        onPress={() =>
          navigation.navigate("BookEditScreen", {
            book: book,
            onGoBack: onGoBack,
          })
        }
      >
        <MaterialIcons name="edit" size={25} color={colors.lightGrey} />
      </TouchableOpacity>
    );
  }
  function Trash() {
    const navigation = useNavigation();
    return (
      <TouchableWithoutFeedback
        onPress={() =>
          Alert.alert(
            t("screens.book.alerts.deleteTitle"),
            t("screens.book.alerts.deleteMessage"),
            [
              { text: t("NO") },
              {
                text: t("YES"),
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
          <Text style={styles.textTrash}>{t("screens.book.removeButton")}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  function CommentDisplayAndEdit() {
    const [editComment, setEditComment] = useState(false);
    const [comment, setComment] = useState(book.comment);

    const { t } = useTranslation();

    const saveComment = () => {
      setEditComment(!editComment);
      if (comment != null && comment != undefined && comment !== book.comment) {
        modifyStateBook({ comment });
        updateBookCommentDB({ id: bookID, comment });
      }
    };
    return (
      <>
        {editComment ? (
          <View>
            <Text style={styles.textSubtitle}>
              {t("screens.book.comment") + " :"}
            </Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder={t("screens.book.addComment")}
              onBlur={saveComment}
              multiline={true}
            />
            <TouchableHighlight
              underlayColor={colors.underlayColor}
              onPress={saveComment}
              style={{ position: "absolute", right: 5, bottom: 3 }}
            >
              <Octicons
                name="check"
                size={25}
                color={colors.middleLightGrey}
                backgroundColor={"transparent"}
              />
            </TouchableHighlight>
          </View>
        ) : (
          <View>
            {comment != null && comment != undefined && (
              <Text style={styles.textSubtitle}>
                {t("screens.book.comment") + " :"}
              </Text>
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  maxWidth: "80%",
                  color:
                    comment != null && comment != undefined
                      ? colors.black
                      : colors.placeholderTextColor,
                }}
              >
                {comment != null && comment != undefined
                  ? comment
                  : t("screens.book.addComment")}
              </Text>
              <View style={{ paddingRight: 0 }}>
                <MaterialIcons.Button
                  name="edit"
                  size={25}
                  style={{ paddingRight: 0 }}
                  color={colors.lightGrey}
                  backgroundColor={"transparent"}
                  underlayColor={colors.underlayColor}
                  onPress={() => setEditComment(!editComment)}
                />
              </View>
            </View>
          </View>
        )}
      </>
    );
  }

  if (!bookLoaded) {
    return <LoadingView white={true} />;
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
              <Text style={styles.textSubtitle}>
                {t("screens.book.readingDates") + " : "}
              </Text>
              <DatePicker
                bookID={bookID}
                initialStartDate={book.readingStartDate}
                initialEndDate={book.readingEndDate}
                updateStateBookFunc={modifyStateBook}
              />
            </View>
            <View style={styles.horizontalLine} />
            {book.summary && (
              <>
                <View style={styles.infosView}>
                  <Text>{book.summary}</Text>
                </View>
                <View style={styles.horizontalLine} />
              </>
            )}
            <InfoList {...book} />
            {book.categories && (
              <>
                <View style={styles.infosView}>
                  <Text style={styles.textSubtitle}>
                    {t("screens.book.categories") + " :"}
                  </Text>
                  <Text>{book.categories.replace(/#/g, "\n")}</Text>
                </View>
                <View style={styles.horizontalLine} />
              </>
            )}
            <View style={styles.infosView}>
              <CommentDisplayAndEdit />
            </View>
            <View style={styles.horizontalLine} />

            <Trash />
            <View style={styles.headerBand}>
              <BackArrow />
              <EditButton />
            </View>
          </ScrollView>
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
  commentInput: {
    backgroundColor: colors.lightGrey,
    borderColor: colors.middleLightGrey,
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    flex: 1,
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
  textSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 5,
  },

  headerBand: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    marginTop: 5,
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
  editButton: {
    borderBottomStartRadius: 25,
    borderTopStartRadius: 25,
  },
  backArrow: {
    borderBottomEndRadius: 25,
    borderTopEndRadius: 25,
  },
});
