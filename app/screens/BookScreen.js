import React, { useState, useEffect, Suspense } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Image,
} from "react-native";
import { colors } from "../constants/Colors";
import { TenStarsTouchable } from "../components/Stars";
import { BookStatusSelector } from "../components/BookStatusSelector";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { BOOK_STATUS } from "../constants/BookStatus";
import { fetchBookInfos } from "../requests";
import { SQLiteProvider } from "expo-sqlite/next";
import LoadingView from "../components/LoadingView";
import { dbName } from "../setupDatabase";

function BackArrow() {
  const navigation = useNavigation();
  return (
    <View style={styles.backArrow}>
      <SimpleLineIcons.Button
        name="arrow-left"
        size={20}
        color={colors.secondary}
        alignSelf="flex-start"
        backgroundColor="transparent"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}
function InfoList(book) {
  const infoProps = [
    { icon: Feather, name: "calendar", text: book.publicationDate },
    { icon: Ionicons, name: "business-outline", text: book.publisher },
    { icon: MaterialCommunityIcons, name: "barcode-scan", text: book.isbn },
    { icon: Feather, name: "book", text: book.pageNumber },
  ];
  return (
    <View style={styles.infosView}>
      {infoProps.map((info, index) => (
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
      ))}
    </View>
  );
}
const imageMargin = 20;

export default function BookScreen({ route, navigation }) {
  const bookID = route.params.bookID;
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 }); // to set the size of the imageView
  const [book, setBook] = useState(null);
  const [bookLoaded, setBookLoaded] = useState(false);
  //console.log("BookScreen", bookID);
  useEffect(() => {
    const fetchBook = async () => {
      const fetchedBook = await fetchBookInfos({ id: bookID });
      //console.log("fetchedBook : ", fetchedBook);
      setBook(fetchedBook);
      if (fetchedBook) {
        setBookLoaded(true);
      }
    };

    fetchBook();
  }, []);
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
                source={require("../../assets/poter_cover-M.jpg")}
                blurRadius={3}
                style={styles.headerImage}
              />
              <Image
                source={require("../../assets/poter_cover-M.jpg")}
                style={styles.cover}
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
                  {book.series}
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
                />
              </View>
              <View style={styles.statusView}>
                <BookStatusSelector
                  bookID={bookID}
                  status={book.status}
                  borrowed={book.borrowed}
                  toExchange={book.toExchange}
                />
              </View>
            </View>
            <View style={styles.horizontalLine} />
            <View style={styles.infosView}>
              <Text>
                Date de lecture {book.readingStartDate} à {book.readingEndDate}.
              </Text>
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
    borderBottomColor: colors.secondary,
    borderBottomWidth: 1,
    marginVertical: 10,
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
});
