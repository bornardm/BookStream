// React and React Native components and hooks
import React, { useEffect, useState, Suspense, useContext } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../constants/Colors";
import { Dropdown } from "react-native-element-dropdown";
import i18next, { languageRessources } from "../localization/i18n";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import {
  getBookStatusProps,
  setDefaultBookStatus,
  getDefaultBookStatus,
} from "../constants/BookStatus";
import { deleteAllLibraryDB } from "../requests";
import { deleteAllFilesFromCovers } from "../setupDatabase";
import ReloadContext from "../reloadContext";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { reloadApp } = useContext(ReloadContext);
  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.row}>
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
              reloadApp();
            }}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.text}>
            {t("screens.settings.changeDefaultStatus")} :{" "}
          </Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            data={getBookStatusProps()
              .slice(0, 4)
              .map((status, index) => ({
                label: status.text,
                value: index,
              }))}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select item"
            searchPlaceholder={t("screens.settings.searchPlaceholder")}
            value={getDefaultBookStatus()}
            onChange={(item) => setDefaultBookStatus(item.value)}
          />
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => {
              console.log("TODO : Import library"); //TODO
            }}
          >
            <View style={styles.iconWithText}>
              <FontAwesome5
                name="download"
                size={20}
                color={colors.darkGrey}
                backgroundColor={"transparent"}
              />
              <Text style={styles.iconText}>
                {t("screens.settings.importLibrary.buttonTitle")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => {
              console.log("TODO : Export library"); //TODO
            }}
          >
            <View style={styles.iconWithText}>
              <MaterialIcons
                name="save"
                size={20}
                color={colors.darkGrey}
                backgroundColor={"transparent"}
              />
              <Text style={styles.iconText}>
                {t("screens.settings.exportLibrary.buttonTitle")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                t("screens.settings.deleteLibrary.alertTitle"),
                t("screens.settings.deleteLibrary.alertMessage"),
                [
                  { text: t("NO") },
                  {
                    text: t("YES"),
                    onPress: async () => {
                      console.log("Erasing library and all covers ");
                      deleteAllLibraryDB();
                      await deleteAllFilesFromCovers();
                      reloadApp();
                    },
                  },
                ]
              )
            }
          >
            <View style={styles.iconWithText}>
              <FontAwesome5
                name="trash"
                size={20}
                color="red"
                backgroundColor={"transparent"}
              />
              <Text style={[styles.iconText, styles.textTrash]}>
                {t("screens.settings.deleteLibrary.buttonTitle")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.middleLightGrey,
    width: "100%",
  },
  iconWithText: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  textTrash: {
    fontWeight: "bold",
    color: "red",
  },
  iconText: {
    marginLeft: 10,
    fontSize: 16,
  },

  // MultiSelect styles
  dropdown: {
    marginHorizontal: 10,
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
