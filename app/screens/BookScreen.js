import React, { useState } from "react";
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
import Icon from "react-native-vector-icons/SimpleLineIcons";
import { useNavigation } from "@react-navigation/native";
import { BOOK_STATUS } from "../constants/BookStatus";

function BackArrow() {
  const navigation = useNavigation();
  return (
    <View style={styles.backArrow}>
      <Icon.Button
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
const imageMargin = 20;

export default function BookScreen({ navigation }) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 }); // to set the size of the imageView

  return (
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
        <Text>Title</Text>
        <Text>Author</Text>
        <Text>Serie</Text>
        <View style={{ alignSelf: "center" }}>
          <TenStarsTouchable rating={5} size={30} />
        </View>
        <BookStatusSelector status={BOOK_STATUS.READ} borrowed={true} />
      </ScrollView>
      <BackArrow />
    </View>
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
});
