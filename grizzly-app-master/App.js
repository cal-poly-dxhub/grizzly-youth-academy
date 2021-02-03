import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, View, Text, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import { Provider } from "react-redux";
import * as Font from "expo-font";
import "react-native-gesture-handler";

import Amplify from "aws-amplify";
import config from "./aws-exports";

import { Authenticator, VerifyContact, RequireNewPassword } from "aws-amplify-react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { store } from "./redux";
import HomeScreen from "./components/HomeScreen/HomeScreen";
import CustomLogin from "./components/LoginScreen/CustomLogin";

Amplify.configure({
  ...config,
  Analytics: {
    disabled: true
  }
});

export function App(props) {
  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        Roboto: require("native-base/Fonts/Roboto.ttf"),
        Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
      });
    })();
  }, []);

  if (props.authState === "signedIn") {
    return (
      <Provider store={store}>
        <StatusBar barStyle="dark-content" translucent backgroundColor={"#6969"} />
        <HomeScreen />
      </Provider>
    );
  }
  return null;
}

class AppForAuth extends React.Component {
  render() {
    return (
      <SafeAreaProvider>
        <Authenticator hideDefault={true}>
          <CustomLogin />
          <VerifyContact />
          <RequireNewPassword />
          <App />
        </Authenticator>
      </SafeAreaProvider>
    );
  }
}

export default AppForAuth;
