import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { colors } from "../constants/Colors";

export default function StatisiticsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Stats</Text>
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
