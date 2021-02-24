import React from "react";
import { View, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useDispatch } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { useSafeAreaInsets, SafeAreaProvider } from "react-native-safe-area-context";

import CalendarTab from "./tabs/Home/HomeTab";
import CommunityTab from "./tabs/Community/CommunityTab";
import ResourcesTab from "./tabs/Resources/ResourcesTab";
import NotificationsTab from "./tabs/Notifications/NotificationsTab";
import ProfileTab from "./tabs/Profile/ProfileTab";
import { getCadetInfo, getRankedCadets, ListNotifications, ListResourceCategories } from "../../queries/queries";

const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e5e4e5",
    alignSelf: "stretch"
  },
  button: { marginTop: 80 }
});

export default function HomeScreen(props) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  React.useEffect(() => {
    props.changeColor("#8B0E04", "light-content");
    dispatch({ type: "SET_INSETS", payload: insets });

    return () => {
      props.changeColor("#fff", "dark-content");
    };
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === "Calendar") {
                  iconName = "ios-calendar";
                } else if (route.name === "Community") {
                  iconName = "ios-people";
                } else if (route.name === "Resources") {
                  iconName = "ios-book";
                } else if (route.name === "Notifications") {
                  iconName = "ios-notifications";
                } else {
                  iconName = "ios-person";
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              }
            })}
            tabBarOptions={{
              activeTintColor: "#0054A4",
              inactiveTintColor: "#8B0E04",
              keyboardHidesTabBar: true
            }}>
            <Tab.Screen name="Profile" component={ProfileTab} />
            <Tab.Screen name="Community" component={CommunityTab} />
            <Tab.Screen name="Calendar" component={CalendarTab} />
            <Tab.Screen name="Resources" component={ResourcesTab} />
            <Tab.Screen name="Notifications" component={NotificationsTab} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </View>
  );
}
