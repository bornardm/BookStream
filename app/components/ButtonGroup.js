import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";

import { colors } from "../constants/Colors";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

function RadioButton({ item, selected, onPress }) {
  //console.log("radioButton", item);
  const size = item.size !== null && item.size !== undefined ? item.size : 15;
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (onPress) {
          console.log("pressed", item.id);
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

function CheckButton({ item, selected, onPress }) {
  //console.log("checkButton", item);
  const size = item.size !== null && item.size !== undefined ? item.size : 15;
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (onPress) {
          console.log("pressed", item.id);
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

export default function ButtonGroup({
  type, // radio or check
  radioButtons,
  selectedId,
  onPress,
  containerStyle,
  startId = 0,
  endId = radioButtons.length,
}) {
  return (
    <View style={containerStyle}>
      {radioButtons.map((item) => {
        // If checkButton is true, render a modified version or a different component
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
