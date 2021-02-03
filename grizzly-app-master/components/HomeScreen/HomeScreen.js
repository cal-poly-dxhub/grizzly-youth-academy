import React from "react";
import { View, Text, Button, StyleSheet, Dimensions, Linking } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useDispatch } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";

import { getCadetInfo, listGoals } from "../../queries/queries";
import HomeTab from "./tabs/Home/HomeTab";
import CommunityTab from "./tabs/Community/CommunityTab";
import ResourcesTab from "./tabs/Resources/ResourcesTab";
import NotificationsTab from "./tabs/Notifications/NotificationsTab";
import ProfileTab from "./tabs/Profile/ProfileTab";
import { useSafeAreaInsets, SafeAreaView, SafeAreaProvider, useSafeAreaFrame } from "react-native-safe-area-context";

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
    dispatch({ type: "SET_INSETS", payload: insets });
    (async () => {
      const r = await getCadetInfo();
      dispatch({ type: "SET_CADET_INFO", payload: r });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === "Home") {
                  iconName = "ios-home";
                } else if (route.name === "Community") {
                  iconName = "ios-people";
                } else if (route.name === "Resources") {
                  iconName = "ios-book";
                } else if (route.name === "Notifications") {
                  iconName = "ios-notifications";
                } else {
                  iconName = "ios-person";
                }

                // You can return any component that you like here!
                return <Ionicons name={iconName} size={size} color={color} />;
              }
            })}
            tabBarOptions={{
              activeTintColor: "#0054A4",
              inactiveTintColor: "#794400",
              keyboardHidesTabBar: true
            }}>
            <Tab.Screen name="Home" component={HomeTab} />
            <Tab.Screen name="Community" component={CommunityTab} />
            <Tab.Screen name="Resources" component={ResourcesTab} />
            <Tab.Screen name="Notifications" component={NotificationsTab} />
            <Tab.Screen name="Profile" component={ProfileTab} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </View>
  );
}

function Dummy() {
  return (
    <View>
      <Text>Dummy</Text>
    </View>
  );
}
