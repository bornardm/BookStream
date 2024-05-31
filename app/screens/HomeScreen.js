import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { colors } from "../constants/Colors";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Button
        title="Go to Book Screen"
        onPress={() => navigation.navigate("BookScreen", { name: "Jane" })}
      />
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
