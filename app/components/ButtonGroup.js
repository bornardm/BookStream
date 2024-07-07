// React and React Native components and hooks
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Third-party libraries/components
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// Utility functions, constants, and other local imports
import { colors } from "../constants/Colors";

/**
 * Renders a radio button component.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.item - The radio button item object containing properties like id, label, size(optional), selectedColor(optional), and unselectedColor(optional).
 * @param {boolean} props.selected - Indicates whether the radio button is selected.
 * @param {Function} props.onPress - The function to be called when the radio button is pressed.
 * @returns {JSX.Element} The rendered radio button component.
 */
function RadioButton({ item, selected, onPress }) {
  const size = item.size !== null && item.size !== undefined ? item.size : 15;
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (onPress) {
          onPress(item.id);
        }
      }}
    >
      <View style={styles.rowButton}>
        <View
          style={[
            styles.radioButtonCircle,
            {
              height: size,
              width: size,
              borderRadius: size / 2,
              borderColor: selected ? item.selectedColor : item.unselectedColor,
            },
          ]}
        >
          {selected && (
            <View
              style={[
                styles.radioButtonCircleSelected,
                {
                  height: 0.7 * size,
                  width: 0.7 * size,
                  borderRadius: (0.7 * size) / 2,
                  backgroundColor: item.selectedColor,
                },
              ]}
            />
          )}
        </View>

        <Text style={styles.radioButtonLabel}>{item.label}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

/**
 * Renders a check button component.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.item - The item object containing properties like id, label, size(optional), selectedColor(optional), and unselectedColor(optional).
 * @param {boolean} props.selected - Indicates whether the button is selected or not.
 * @param {Function} props.onPress - The function to be called when the button is pressed.
 * @returns {JSX.Element} The check button component.
 */
function CheckButton({ item, selected, onPress }) {
  const size = item.size !== null && item.size !== undefined ? item.size : 15;
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (onPress) {
          onPress(item.id);
        }
      }}
    >
      <View style={styles.rowButton}>
        <MaterialIcons
          name={selected ? "check-box" : "check-box-outline-blank"}
          size={size}
          color={selected ? item.selectedColor : item.unselectedColor}
        />

        <Text style={styles.radioButtonLabel}>{item.label}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

/**
 * ButtonGroup component that renders a group of buttons.
 *
 * @param {Object} props - The component props.
 * @param {string} props.type - The type of buttons to render. Must be "radio" or "check".
 * @param {Array} props.buttonsData - The data for the buttons. Must include id, label, value (must also include selected for check type).
 * @param {number} props.selectedId - The ID of the currently selected button (only for radio type).
 * @param {function} props.onPress - The function to be called when a button is pressed.
 * @param {Object} props.containerStyle - The style object for the container of the group of buttons.
 * @param {number} [props.startId=0] - The starting ID for rendering buttons.
 * @param {number} [props.endId=buttonsData.length] - The ending ID for rendering buttons.
 * @returns {JSX.Element} The rendered ButtonGroup component.
 * @throws {Error} If the type prop is not "radio" or "check".
 */
export default function ButtonGroup({
  type, // radio or check
  buttonsData,
  selectedId,
  onPress,
  containerStyle,
  startId = 0,
  endId = buttonsData.length,
}) {
  return (
    <View style={containerStyle}>
      {buttonsData.map((item) => {
        if (type === "radio") {
          if (item.id >= startId && item.id <= endId) {
            return (
              <RadioButton
                key={item.id}
                item={item}
                selected={selectedId === item.id}
                onPress={onPress}
              />
            );
          }
        } else if (type === "check") {
          if (item.id >= startId && item.id <= endId) {
            return (
              <CheckButton
                key={item.id}
                item={item}
                selected={item.selected}
                onPress={onPress}
              />
            );
          }
        } else {
          throw new Error(
            "Invalid type in ButtonGroup component. Must be radio or check."
          );
          return null;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rowButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  radioButtonCircle: {
    borderWidth: 1,
    borderColor: colors.middleLightGrey,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonCircleSelected: {
    backgroundColor: colors.middleLightGrey,
  },
  radioButtonLabel: {
    marginLeft: 10,
  },
  checkButtonSquare: {
    borderWidth: 1,
    borderColor: colors.middleLightGrey,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
});
