import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Button,
  TextInput,
} from "react-native";
import { colors } from "../constants/Colors";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import { defaultStatus } from "../constants/BookStatus";

export default function AddScreen({ route, navigation }) {
  const addBookPreviewFunc = route.params.addBookPreviewFunc;
  const [searchText, setSearchText] = useState(null);

  const onGoBackFromBookEditScreen = ({ id, title, author, imageName }) => {
    navigation.goBack();
    console.log("Go back from BookEditScreen");
    const preview = {
      id: id,
      title: title,
      author: author,
      rating: null,
      status: defaultStatus,
      imageName: imageName,
    };
    console.log("PREVIEW : ", preview);
    addBookPreviewFunc(preview);
    //id, title, author, rating, status, imageName
  };

  return (
    <View style={styles.container}>
      <Text>Add Screen</Text>
      <MaterialCommunityIcons.Button
        name="barcode-scan"
        style={styles.scanButton}
        color={colors.black}
        backgroundColor={colors.white}
        onPress={() => {
          console.log("Scan button pressed");
          navigation.navigate("ScannerScreen", {
            onGoBack: setSearchText,
          });
        }}
      />
      <View style={styles.inputView}>
        <EvilIcons name="search" size={35} color={colors.textInputBorder} />
        <TextInput
          placeholder="Title, isbn, author..."
          value={searchText}
          onChangeText={setSearchText}
          text
          style={styles.textInput}
          placeholderTextColor={colors.placeholderTextColor}
          maxLength={200}
        />
      </View>
      <Button
        title="Add manually"
        onPress={() => {
          console.log("Add manually button pressed");
          navigation.navigate("BookEditScreen", {
            bookID: null,
            onGoBack: onGoBackFromBookEditScreen,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 0,
    paddingLeft: 10,
    borderColor: colors.textInputBorder,
    borderWidth: 1,
  },
  inputView: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 5,
    borderColor: colors.textInputBorder,
    borderWidth: 1,
    margin: 10,
  },
  textInput: {
    padding: 10,
    flex: 1,
  },
});
