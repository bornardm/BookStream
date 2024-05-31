import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/Colors";

export default function BookScreen() {
  return (
    <View style={styles.container}>
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
  },
});
