import React from "react";
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

export default function BookPreview() {
  const navigation = useNavigation();
  return (
    <TouchableWithoutFeedback
      onPress={() => navigation.navigate("BookScreen", { name: "Jane" })}
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/poter_cover-M.jpg")}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.title}>Title</Text>
          <Text style={styles.author}>Author</Text>
          <View style={styles.stars}>
            <FiveStarsDisplay rating={5} size={20} />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: colors.white,
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
});
