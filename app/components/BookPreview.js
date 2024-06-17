import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Button,
} from "react-native";
import { colors } from "../constants/Colors";
import { FiveStarsDisplay } from "./Stars";
import { useNavigation } from "@react-navigation/native";
import { BOOK_STATUS, BOOK_STATUS_PROPS } from "../constants/BookStatus";
import { coversDir } from "../setupDatabase";

function BadgeStatus({ status }) {
  const statusProps = BOOK_STATUS_PROPS[status];
  const IconComponent = statusProps.iconLibrary;
  return (
    <View style={[styles.badge, { backgroundColor: statusProps.color }]}>
      <IconComponent name={statusProps.iconName} style={styles.badgeIcon} />
      <Text style={[styles.badgeText, { backgroundColor: statusProps.color }]}>
        {statusProps.text}
      </Text>
    </View>
  );
}

export default function BookPreview({
  bookID,
  title,
  author,
  rating,
  status,
  imageName,
  functions, // receive the function as a prop
}) {
  // console.log("BookPreview", bookID, title, author, rating, status, imageName);
  const navigation = useNavigation();
  const [imageNameState, setImageNameState] = useState(imageName);

  useEffect(() => {
    setImageNameState(imageName);
  }, [imageName]);

  return (
    <TouchableWithoutFeedback
      onPress={() =>
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
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.author}>{author}</Text>
          <View style={styles.stars}>
            <FiveStarsDisplay rating={rating} size={20} />
          </View>
        </View>
        <BadgeStatus status={status} />
      </View>
    </TouchableWithoutFeedback>
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
