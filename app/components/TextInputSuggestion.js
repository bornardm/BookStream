// React and React Native components and hooks
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { colors } from "../constants/Colors";

export default function TextInputSuggestion({
  suggestions,
  maxSuggestionsHeight,
  style,
  borderRadius,
  borderColor,
  borderWidth,
  height,
  onChangeText,
  onEndEditing,
  onSubmitEditing,
  textInputOptions,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [text, setText] = useState(null);

  //TODO : Verify that some options ar not in the textInputOptions (raise errror if they are)

  const onSuggestionPress = (textPressed) => {
    console.log("onSuggestionPress", textPressed);
    setText(textPressed);
    setShowSuggestions(false);
  };

  console.log("suggestions", suggestions);
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.textInput,
          {
            borderRadius: borderRadius || 5,
            borderColor: borderColor || colors.textInputBorder,
            borderWidth: borderWidth || 1,
            height: height || 40,
          },
        ]}
      >
        <TextInput
          {...textInputOptions}
          value={text}
          onChangeText={(text) => setText(text)}
          onFocus={() => setShowSuggestions(true)}
          //onBlur={() => setShowSuggestions(false)}
        />
      </View>
      <View style={styles.suggestionsContainer}>
        {showSuggestions ? (
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => String(index)} // Using index as a key
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => onSuggestionPress(item.text)}>
                <Text style={styles.suggestionText}>{item.text}</Text>
              </TouchableOpacity>
            )}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    width: "100%",
  },
  suggestionsContainer: {
    backgroundColor: "blue",
  },
  suggestionText: {
    padding: 10,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
  },
  inputView: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
  },
});
