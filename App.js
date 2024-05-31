import React from "react";
import { Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./app/screens/HomeScreen";
import BookScreen from "./app/screens/BookScreen";
import MenuScreen from "./app/screens/MenuScreen";
import { colors } from "./app/constants/Colors";
import Icon from "react-native-vector-icons/SimpleLineIcons";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black, //color of the title
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={({ navigation }) => ({
            headerLeft: () => (
              <Icon.Button
                name="menu"
                color={colors.black}
                backgroundColor="transparent"
                onPress={() => navigation.navigate("MenuScreen")}
              />
            ),
            headerTitle: "My Books",
          })}
        />
        <Stack.Screen
          name="BookScreen"
          component={BookScreen}
          options={{ headerTitle: "Book" }}
        />
        <Stack.Screen
          name="MenuScreen"
          component={MenuScreen}
          options={{ headerTitle: "Menu" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
