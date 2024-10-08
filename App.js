import "react-native-gesture-handler";
import React, { useEffect, useState, useCallback } from "react";
import { Button, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { LogBox } from "react-native";
import i18next from "./app/localization/i18n";
import { useTranslation } from "react-i18next";

import HomeScreen from "./app/screens/HomeScreen";
import BookScreen from "./app/screens/BookScreen";
import BookEditScreen from "./app/screens/BookEditScreen";
import StatisiticsScreen from "./app/screens/StatisticsScreen";
import LoadindingView from "./app/components/LoadingView";
import AddScreen from "./app/screens/AddScreen";
import ScannerScreen from "./app/screens/ScannerScreen";
import SettingsScreen from "./app/screens/SettingsScreen";
import { colors } from "./app/constants/Colors";
import { loadDatabase } from "./app/setupDatabase";
import ReloadContext from "./app/reloadContext";
import { fetchSettings } from "./app/settingsRequestDB";

//ignore some warnigs
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);
LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);

const HomeStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const HomeStackScreen = () => {
  const { t, i18n } = useTranslation();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerTitle: t("app.navigationTitle.homeScreen") }}
      />
      <HomeStack.Screen
        name="BookScreen"
        component={BookScreen}
        options={{ headerTitle: t("app.navigationTitle.bookScreen") }}
      />
      <HomeStack.Screen
        name="BookEditScreen"
        component={BookEditScreen}
        options={{ headerTitle: t("app.navigationTitle.bookEditScreen") }}
      />
      <HomeStack.Screen
        name="AddScreen"
        component={AddScreen}
        options={{ headerTitle: t("app.navigationTitle.addScreen") }}
      />
      <HomeStack.Screen
        name="ScannerScreen"
        component={ScannerScreen}
        options={{ headerTitle: t("app.navigationTitle.scannerScreen") }}
      />
    </HomeStack.Navigator>
  );
};

export default function App() {
  const { t } = useTranslation();

  //for reloading the app
  const [key, setKey] = useState(0);
  const reloadApp = useCallback(() => {
    console.log("Reloading App");
    setKey((prevKey) => prevKey + 1);
  }, []);

  const [dbLoaded, setDbLoaded] = useState(false);

  useEffect(() => {
    loadDatabase()
      .then(() => {
        fetchSettings();
        setDbLoaded(true); //load user settings from the database
      })
      .catch((e) => console.error(e));
  }, []);
  if (!dbLoaded) {
    return <LoadindingView />;
  }

  return (
    <ReloadContext.Provider value={{ reloadApp }}>
      <NavigationContainer key={key}>
        <Drawer.Navigator
          initialRouteName="=HomeScreen"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.white,
            },
            headerShown: true,
            headerTintColor: colors.black, //color of the title
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Drawer.Screen
            name="Home"
            component={HomeStackScreen}
            options={{ title: t("app.navigationTitle.homeScreen") }}
          />
          <Drawer.Screen
            name="StatisticsScreen"
            component={StatisiticsScreen}
            options={{ title: t("app.navigationTitle.statisticsScreen") }}
          />
          <Drawer.Screen
            name="SettingsScreen"
            component={SettingsScreen}
            options={{ title: t("app.navigationTitle.settingsScreen") }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </ReloadContext.Provider>
  );
}
