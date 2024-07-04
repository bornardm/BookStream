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

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const viewProportion = 0.9;

export default function FilterView({ showFilter, setShowFilter }) {
  const [windowsHeight, setWindowsHeight] = useState(
    Dimensions.get("window").height
  );
  const translateY = useRef(new Animated.Value(windowsHeight)).current; // initial position outside of the screen

  // Update height when the screen dimensions change
  useEffect(() => {
    const onChange = () => {
      console.log(Dimensions.get("window").height);
      setWindowsHeight(Dimensions.get("window").height);
    };

    // Subscribe to dimension changes and save the subscription
    const subscription = Dimensions.addEventListener("change", onChange);

    // Return a cleanup function that removes the event listener
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: showFilter
        ? windowsHeight * (1 - viewProportion)
        : windowsHeight,
      duration: 300,
      useNativeDriver: true,
    }).start();
    console.log("showFilter changed");
  }, [showFilter]);

  return (
    <Animated.View
      style={[
        styles.filterContainer,
        { height: viewProportion * windowsHeight, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Sorting and filters</Text>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons.Button
            name="close"
            color="black"
            backgroundColor="transparent"
            onPress={() => setShowFilter(false)}
            iconStyle={{ marginRight: 0 }}
          />
        </View>
      </View>
      {/* Add your filter options here */}
    </Animated.View>
  );
}

//<FilterComponent showFilter={showFilter} setShowFilter={setShowFilter} />

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "blue",
  },
  filterContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "green",
  },
});
