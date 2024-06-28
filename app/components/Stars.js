// React and React Native components and hooks
import React, { useState } from "react";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";

// Third-party libraries/components
import Icon from "react-native-vector-icons/FontAwesome";

// Utility functions, constants, and other local imports
import { updateBookRatingDB } from "../requests";

/**
 * Renders a display of five stars based on the given rating.
 * @param {Object} props - The component props.
 * @param {integer} props.rating - The rating value in [0,10].
 * @param {number} props.size - The size of the stars.
 * @returns {JSX.Element} - The rendered component.
 */
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

/**
 * Renders a component with ten stars that can be clicked to update the rating.
 *
 * @param {Object} props - The component props.
 * @param {integer} props.bookID - The ID of the book.
 * @param {integer} props.rating - The current rating of the book in [0,10].
 * @param {number} props.size - The size of the stars.
 * @param {function} props.updateStateBookFunc - The function to update the book's state.
 * @returns {JSX.Element} The rendered component.
 */
export function TenStarsTouchable({
  bookID,
  rating,
  size,
  updateStateBookFunc,
}) {
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
              setRating(index + 1);
              updateBookRatingDB({ id: bookID, rating: index + 1 });
              updateStateBookFunc({ rating: index + 1 });
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
