import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { colors } from "../constants/Colors";
import Icon from "react-native-vector-icons/SimpleLineIcons";

export default function BookScreen({ navigation }) {
  return (
    <View style={styles.container}>
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

      <Text>Here is book screen!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  backArrow: {
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
  },
});
