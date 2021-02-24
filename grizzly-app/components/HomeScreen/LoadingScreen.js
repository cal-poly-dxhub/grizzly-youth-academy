import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useDispatch } from "react-redux";
import { useSafeAreaInsets, SafeAreaProvider } from "react-native-safe-area-context";

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

export default function LoadingScreen(props) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const updateNotification = React.useCallback(async () => {
    const listNotifs = await ListNotifications();
    dispatch({ type: "SET_NOTIFICATION", payload: listNotifs.sort((a, b) => (a.Viewed > b.Viewed ? 1 : -1)) });
  }, []);

  const updateRanking = React.useCallback(async () => {
    const ranks = await getRankedCadets();
    dispatch({ type: "SET_RANKING", payload: ranks.sort((a, b) => (a.Points > b.Points ? -1 : 1)) });
  }, []);

  const updateCadetInfo = React.useCallback(async () => {
    const cadetInfo = await getCadetInfo();
    dispatch({ type: "SET_CADET_INFO", payload: cadetInfo });
  }, []);

  const updateResourceCategories = React.useCallback(async () => {
    const listResourceCat = await ListResourceCategories();
    dispatch({ type: "SET_RESOURCE_CATEGORY", payload: listResourceCat });
  }, []);

  React.useEffect(() => {
    props.changeColor("#8B0E04", "light-content");
    dispatch({ type: "SET_INSETS", payload: insets });

    updateRanking();
    updateNotification();
    updateCadetInfo();
    updateResourceCategories();

    return () => {
      props.changeColor("#fff", "dark-content");
    };
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaProvider>
      <Text style={{ fontWeight: "600", fontSize: 24, paddingTop: 100, paddingBottom: 10, paddingLeft: 10, paddingRight: 10}}>Welcome Cadet!</Text>
      <Text style={{ fontWeight: "400", fontSize: 22, paddingTop: 30, paddingBottom: 10, paddingLeft: 10, paddingRight: 10 }}>Our Mission:</Text>
      <Text style={{ fontWeight: "400", fontSize: 18, paddingTop: 30, paddingBottom: 10, paddingLeft: 10, paddingRight: 10 }}>The mission of the National Guard Youth ChalleNGe Program is to intervene in and reclaim the lives of 16-18 year old high school dropouts. Graduates leave the program with the values, life skills, education, and self-discipline necessary to succeed as productive citizens.</Text>
      </SafeAreaProvider>
    </View>
  );
}
