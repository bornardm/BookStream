// React and React Native components and hooks
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Modal,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  TouchableHighlight,
  ToastAndroid,
} from "react-native";

// Third-party libraries/components
import * as FileSystem from "expo-file-system";

// Utility functions, constants, and other local imports
import { colors } from "../constants/Colors";
import ButtonGroup from "./ButtonGroup";

const { StorageAccessFramework } = FileSystem;

const checkButtonProps = {
  selectedColor: "blue",
  unselectedColor: colors.middleLightGrey,
  size: 17,
  selected: false,
};
const exportOptions = [
  {
    id: 1,
    label:
      "Save library for future imports (export the database (.db) file) (recommended)",
    value: "db",
    ...checkButtonProps,
    selected: true,
  },
  {
    id: 2,
    label: "Save library for sharing and for future imports (export as JSON) TODO",
    value: "json",
    ...checkButtonProps,
  },
  {
    id: 3,
    label:
      "Save library for personal use (export as CSV, compatible with Excel) TODO",
    value: "csv",
    ...checkButtonProps,
  },
];

export default function ExportLibrary({ visible, setIsVisible }) {
  const [exportOptionsData, setExportOptionsData] = useState(exportOptions);

  const exportDB = async () => {
    console.log("Exporting db");
    fileName = "bookStreamDB.db";
    fileString = "";
    try {
      //get the .db file content
      fileString = await FileSystem.readAsStringAsync(
        `${FileSystem.documentDirectory}SQLite/bookStreamDB.db`,
        {
          encoding: "base64",
        }
      );
    } catch (e) {
      console.log("Error during getting Database file : " + e);
      alert("Internal error: Couldn't access the database.");
    }
    try {
      //verify permissions for the directory
      const permissions =
        await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        console.log("Permission error");
        alert(
          "Permission error: Unable to export the file because the necessary permissions were not granted."
        );
        return;
      }

      //export the file
      await StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        "application/x-sqlite3"
      ).then(async (uri) => {
        console.log("before");
        await FileSystem.writeAsStringAsync(uri, fileString, {
          encoding: "base64",
        });
        console.log("Database exported successfully");
        ToastAndroid.show("Database Exported Successfully", ToastAndroid.SHORT);
      });
    } catch (e) {
      console.log("Error during saving the file : " + e);
      alert("Internal error: Couldn't export the database.");
    }
  };

  const handlePressExport = () => {
    if (exportOptionsData[0].selected) {
      // export db
      exportDB();
    }
    if (exportOptionsData[1].selected) {
      console.log("TODO : export json");
    }
    if (exportOptionsData[2].selected) {
      // export csv
      console.log("TODO export CSV");
    }
    setIsVisible(false);
  };

  const handlePressCheckButton = (id) => {
    const newExportOptions = exportOptionsData.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          selected: !item.selected,
        };
      }
      return item;
    });
    setExportOptionsData(newExportOptions);
  };
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={() => {
        setIsVisible(false);
      }}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          setIsVisible(false);
        }}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.popup}>
              <View>
                <ButtonGroup
                  type="check"
                  buttonsData={exportOptionsData}
                  selected={1}
                  onPress={handlePressCheckButton}
                  containerStyle={styles.buttonGroupContainer}
                />
              </View>
              <View style={styles.bootomButtons}>
                <TouchableHighlight
                  style={styles.button}
                  underlayColor={colors.underlayColor}
                  onPress={() => setIsVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  style={styles.button}
                  underlayColor={colors.underlayColor}
                  onPress={handlePressExport}
                >
                  <Text style={styles.buttonText}>Export</Text>
                </TouchableHighlight>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: "90%",
    padding: 20,
    paddingVertical: 30,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonGroupContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  bootomButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  buttonText: {
    fontSize: 16,
    color: "deepskyblue",
    fontWeight: "bold",
  },
  button: {
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
});
