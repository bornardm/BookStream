// React and React Native components and hooks
import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  TouchableHighlight,
} from "react-native";

// Third-party libraries/components
import { useNavigation } from "@react-navigation/native";

// Utility functions, constants, and other local imports
import { colors } from "../constants/Colors";
import ButtonGroup from "./ButtonGroup";

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
    label: "Save library for sharing and for future imports (export as JSON)",
    value: "json",
    ...checkButtonProps,
  },
  {
    id: 3,
    label:
      "Save library for personal use (export as CSV, compatible with Excel)",
    value: "csv",
    ...checkButtonProps,
  },
];

export default function ExportLibrary({ visible, setIsVisible }) {
  const [exportOptionsData, setExportOptionsData] = useState(exportOptions);

  const handelPressExport = () => {
    if (exportOptionsData[0].selected) {
      // export db
    }
    if (exportOptionsData[1].selected) {
    }
    if (exportOptionsData[2].selected) {
      // export csv
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
                  onPress={handelPressExport}
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
