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
import Autocomplete from "react-native-autocomplete-input";

import { colors } from "../constants/Colors";

/**
 * Renders a text component with bold matching text based on a query.
 * in the text, only the query is bold.
 *
 * @param {Object} props - The component props.
 * @param {string} props.text - The text to be rendered.
 * @param {string} props.query - The query used to find the matching text.
 * @returns {JSX.Element} The rendered component.
 */
const BoldMatchingText = ({ text, query }) => {
  if (!query) return <Text>{text}</Text>;

  const matchStart = text.toLowerCase().indexOf(query.toLowerCase());
  if (matchStart === -1) return <Text>{text}</Text>;

  const matchEnd = matchStart + query.length;
  const beforeMatch = text.substring(0, matchStart);
  const matchText = text.substring(matchStart, matchEnd);
  const afterMatch = text.substring(matchEnd);

  return (
    <Text>
      {beforeMatch}
      <Text style={{ fontWeight: "bold" }}>{matchText}</Text>
      {afterMatch}
    </Text>
  );
};

/**
 * Merges multiple styles into a single object, excluding the 'flex' property.
 *
 * @param {Object|Array} styles - The styles to merge. Can be a single object or an array of objects.
 * @returns {Object} - The merged styles object.
 */
const mergeStylesExcludingFlex = (styles) => {
  // Convert styles to an array if it's not already an array
  const stylesArray = Array.isArray(styles) ? styles : [styles];
  // Merge styles into a single object and exclude the 'flex' property
  return stylesArray.reduce((acc, style) => {
    const { flex, ...rest } = style;
    return { ...acc, ...rest };
  }, {});
};

export default function TextInputWithSuggestions({
  suggestionsArrray,
  textInputStyle,
  placeholder,
  defaultValue,
  placeholderTextColor,
  maxLength,
  keyboardType,
  onChangeText,
  onEndEditing,
  onSubmitEditing,
  value,
}) {
  //------------------------ Variables and States------------------------
  const [suggestions, setSuggestions] = useState(suggestionsArrray); //List of the suggestions
  const [query, setQuery] = useState(defaultValue || ""); //texte enter in the input
  const [showSuggestions, setShowSuggestions] = useState(false);

  const restTextInputStyle = textInputStyle
    ? mergeStylesExcludingFlex(textInputStyle)
    : {}; //Style resulting from the merge of the styles of the text input and excluding the flex property

  // Filter suggestions based on query
  const filteredSuggestions = query
    ? suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  //------------------------ Functions-----------------------------------

  // Render each item in the autocomplete dropdown, it's a TouchableOpacity that when clicked will set the query to the item and hide the suggestions
  const renderSuggestionItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setQuery(item);
          setShowSuggestions(false);
          if (onChangeText) {
            onChangeText(item);
          }
          if (onSubmitEditing) {
            onSubmitEditing({ nativeEvent: { text: item } });
          }
          if (onEndEditing) {
            onEndEditing({ nativeEvent: { text: item } });
          }
        }}
      >
        <View style={{ padding: 10 }}>
          <BoldMatchingText text={item} query={query} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Autocomplete
      {...(placeholder && { placeholder })}
      {...(placeholderTextColor && { placeholderTextColor })}
      {...(maxLength && { maxLength })}
      {...(keyboardType && { keyboardType })}
      {...(onEndEditing && { onEndEditing })}
      {...(onSubmitEditing && { onSubmitEditing })}
      {...(value && { value })}
      style={[
        { backgroundColor: "transparent" },
        restTextInputStyle,
        { marginBottom: 0, padding: 5 },
      ]}
      inputContainerStyle={{
        borderWidth: 0,
      }}
      data={filteredSuggestions}
      defaultValue={query}
      onChangeText={(text) => {
        setQuery(text);
        if (onChangeText) {
          onChangeText(text);
        }
      }}
      onFocus={() => setShowSuggestions(true)}
      onBlur={() => {
        setTimeout(() => setShowSuggestions(false), 1000);
      }} // Delay hiding the suggestions to allow the user to click on them
      nestedScrollEnabled={true} // Allow nested scrolling
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderSuggestionItem}
      renderResultList={() =>
        showSuggestions ? (
          <FlatList
            style={[
              styles.suggestionsFlatList,
              { margin: (textInputStyle?.margin || 0) + 5, marginTop: 0 },
            ]}
            data={filteredSuggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderSuggestionItem}
            nestedScrollEnabled={true} // Allow nested scrolling
          />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  suggestionsFlatList: {
    maxHeight: 150,
    backgroundColor: colors.white,
    borderRadius: 2,
    // Shadow properties
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // for Android
  },
});
