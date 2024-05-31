import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "./app/constants/colors";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up your App.js to start working on your app!</Text>
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
