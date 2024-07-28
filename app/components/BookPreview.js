// React and React Native components and hooks
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Third-party libraries/components
import { useNavigation } from "@react-navigation/native";

// Utility functions, constants, and other local imports
import { colors } from "../constants/Colors";
import { BOOK_STATUS, getBookStatusProps } from "../constants/BookStatus";
import { coversDir } from "../setupDatabase";
import { FiveStarsDisplay } from "./Stars";

function BadgeStatus({ status }) {
  const statusProps = getBookStatusProps()[status];
  const IconComponent = statusProps.iconLibrary;
  return (
    <View style={[styles.badge, { backgroundColor: statusProps.color }]}>
      <IconComponent name={statusProps.iconName} style={styles.badgeIcon} />
      <Text style={styles.badgeText}>{statusProps.text}</Text>
    </View>
  );
}

/**
 * Renders a preview of a book.
 *
 * @param {Object} props - The component props.
 * @param {integer} props.bookID - The ID of the book.
 * @param {string} props.title - The title of the book.
 * @param {string} props.author - The author of the book.
 * @param {integer} props.rating - The rating of the book in [0,10].
 * @param {integer} props.status - The status of the book (cf BookSatatus.js).
 * @param {string} props.imageName - The name of the book's image.
 * @param {boolean} props.touchable - Whether the component is touchable.
 * @param {Object} props.functions - The functions to be passed as props (not used if touchable is false).
 * @returns {JSX.Element} The rendered component.
 */
export default function BookPreview({
  bookID,
  title,
  author,
  rating,
  status,
  imageName,
  touchable = true,
  functions, // receive the function as a prop
}) {
  // console.log("BookPreview", bookID, title, author, rating, status, imageName);
  const navigation = useNavigation();
  const [imageNameState, setImageNameState] = useState(imageName);
  const WraperComponent = touchable ? TouchableOpacity : View;

  useEffect(() => {
    setImageNameState(imageName);
  }, [imageName]);

  return (
    <WraperComponent
      onPress={() =>
        touchable &&
        navigation.navigate("BookScreen", {
          bookID: bookID,
          functions: functions, // pass the functions as a parameter
        })
      }
    >
      <View style={styles.container}>
        <Image
          source={
            imageNameState
              ? { uri: `${coversDir}${imageNameState}` }
              : require("../../assets/no_image.jpg")
          }
          onError={() => setImageNameState(null)}
          style={styles.image}
        />
        <View style={styles.info}>
          <View style={styles.titleAuthorContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.author}>{author}</Text>
          </View>
          <View style={styles.stars}>
            <FiveStarsDisplay rating={rating} size={20} />
          </View>
        </View>
        <BadgeStatus status={status} />
      </View>
    </WraperComponent>
  );
}

const badgeHeight = 30;
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "transparent",
    borderRadius: 10,
    margin: 5,
  },
  image: {
    width: 70,
    height: 100,
    borderRadius: 5,
  },
  info: {
    marginLeft: 10,
    backgroundColor: "transparent",
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  titleAuthorContainer: {
    flex: 1,
    marginBottom: 25,
  },

  stars: {
    position: "absolute",
    bottom: 0,
  },
  badge: {
    padding: 5,
    paddingHorizontal: 7,

    alignSelf: "flex-end",
    height: badgeHeight,
    borderRadius: badgeHeight / 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "blue",
  },
  badgeText: {
    color: colors.white,
  },
  badgeIcon: {
    color: colors.white,
    fontSize: badgeHeight / 2,
    marginRight: 5,
  },
});
