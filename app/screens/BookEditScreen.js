import React, { useState, useEffect, Suspense } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Image,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { colors } from "../constants/Colors";

import { useNavigation } from "@react-navigation/native";

export default function BookEditScreen({ route }) {
  return (
    <View>
      <Text>Book Edit Screen</Text>
    </View>
  );
}
