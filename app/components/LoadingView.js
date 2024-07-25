import React from "react";
import { View, Image, Text, StyleSheet, ActivityIndicator } from "react-native";
import i18next from "../localization/i18n";
import { useTranslation } from "react-i18next";
import { colors } from "../constants/Colors";

export default function LoadindingView({ white = false }) {
  const { t } = useTranslation();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: white ? colors.white : "#fcd404" },
      ]}
    >
      <Image
        source={
          white
            ? require("../../assets/icon-white.gif")
            : require("../../assets/icon.gif")
        }
        style={{ width: 200, height: 200 }}
      />
      <Text style={{ marginBottom: 20 }}>{t("loading") + "..."}</Text>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}
//TODO
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
