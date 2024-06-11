import React, { useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";

export function FiveStarsDisplay({ rating, size }) {
  const ratings = [0, 2, 4, 6, 8];

  return (
    <View style={styles.starsContainer}>
      {ratings.map((value, index) => {
        let name;
        if (!rating) {
          name = "star";
        } else if (rating <= value) {
          name = "star-o";
        } else if (rating >= value + 2) {
          name = "star";
        } else {
          name = "star-half-empty";
        }

        return (
          <Icon
            key={index}
            name={name}
            size={size}
            color={rating ? "gold" : "gainsboro"}
            style={styles.star}
          />
        );
      })}
    </View>
  );
}

export function TenStarsTouchable({ rating, size }) {
  const [ratingState, setRating] = useState(rating);
  const ratings = Array.from({ length: 10 }, (_, index) => index);
  return (
    <View style={styles.starsContainer}>
      {ratings.map((value, index) => {
        let name;
        if (ratingState <= value) {
          name = "star-o";
        } else {
          name = "star";
        }

        return (
          <TouchableWithoutFeedback
            key={index}
            onPress={() => {
              console.log(`Star ${index + 1} was pressed.`);
              setRating(index + 1);
            }} // Update the rating when a star is clicked
          >
            <Icon name={name} size={size} color="gold" style={styles.star} />
          </TouchableWithoutFeedback>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  starsContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
  },
  star: {
    marginRight: 4, // Add space to the right of each star
  },
});
