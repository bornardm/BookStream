import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

import HomeScreen from "./app/screens/HomeScreen";
import BookScreen from "./app/screens/BookScreen";
import MenuScreen from "./app/screens/MenuScreen";
import { colors } from "./app/constants/Colors";

const HomeStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const HomeStackScreen = () => (
  <HomeStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <HomeStack.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={{ headerTitle: "My Books" }}
    />
    <HomeStack.Screen
      name="BookScreen"
      component={BookScreen}
      options={{ headerTitle: "Book" }}
    />
  </HomeStack.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="=HomeScreen"
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
        <Drawer.Screen name="Home" component={HomeStackScreen} />
        <Drawer.Screen
          name="MenuScreen"
          component={MenuScreen}
          options={{ headerTitle: "Menu" }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
