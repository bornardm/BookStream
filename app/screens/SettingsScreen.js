// React and React Native components and hooks
import React, { useEffect, useState, Suspense } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { colors } from "../constants/Colors";
import { Dropdown } from "react-native-element-dropdown";
import i18next, { languageRessources } from "../localization/i18n";
import { useTranslation } from "react-i18next";

export default function SettingsScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.language}>
        <Text style={styles.text}>
          {t("screens.settings.changeLanguage")} :{" "}
        </Text>

        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          data={Object.keys(languageRessources).map((key) => ({
            label: key,
            value: key,
          }))}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select item"
          searchPlaceholder={t("screens.settings.searchPlaceholder")}
          value={i18next.language}
          onChange={(item) => {
            i18next.changeLanguage(item.value);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
  },
  language: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  // MultiSelect styles
  dropdown: {
    margin: 16,
    padding: 10,
    height: 50,
    borderColor: colors.middleLightGrey,
    borderWidth: 1,
    borderRadius: 5,
    flex: 1,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
