import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

import HomeScreen from "./app/screens/HomeScreen";
import BookScreen from "./app/screens/BookScreen";
import BookEditScreen from "./app/screens/BookEditScreen";
import MenuScreen from "./app/screens/MenuScreen";
import LoadindingView from "./app/components/LoadingView";
import { colors } from "./app/constants/Colors";
import { loadDatabase } from "./app/setupDatabase";
import { LogBox } from "react-native";

//ignore some warnigs
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

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
    <HomeStack.Screen
      name="BookEditScreen"
      component={BookEditScreen}
      options={{ headerTitle: "Edit Book" }}
    />
  </HomeStack.Navigator>
);

export default function App() {
  const [dbLoaded, setDbLoaded] = useState(false);
  useEffect(() => {
    loadDatabase()
      .then(() => setDbLoaded(true))
      .catch((e) => console.error(e));
  }, []);
  if (!dbLoaded) {
    console.log("Loading database...");
    return <LoadindingView />;
  }

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
