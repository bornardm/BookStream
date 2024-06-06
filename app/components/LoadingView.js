import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function LoadindingView() {
  return (
    <View style={styles.container}>
      <Text> Loading database...</Text>
    </View>
  );
}
//TODO
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: "red",
  },
});
