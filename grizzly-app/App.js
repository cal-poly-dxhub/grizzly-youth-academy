import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, View, Text, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { MenuProvider } from "react-native-popup-menu";

import { Provider } from "react-redux";
import * as Font from "expo-font";
import "react-native-gesture-handler";

import Amplify from "aws-amplify";
import config from "./aws-exports";

import { Authenticator, VerifyContact, RequireNewPassword, ForgotPassword } from "aws-amplify-react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { store } from "./redux";
import HomeScreen from "./components/HomeScreen/HomeScreen";
import LoadingScreen from "./components/HomeScreen/LoadingScreen";
import CustomLogin from "./components/LoginScreen/CustomLogin";

Amplify.configure({
  ...config,
  Analytics: {
    disabled: true
  }
});

export function App(props) {

  const [loading, setLoading] = useState(true);
  const waitPeriodInMilli = 6000;

  useEffect(() => {
      setTimeout(() => setLoading(false), waitPeriodInMilli)
    }, []);

  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        Roboto: require("native-base/Fonts/Roboto.ttf"),
        Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
      });
    })();
  }, []);

  if (props.authState === "signedIn") {
    return loading == false ? (
      <Provider store={store}>
        <HomeScreen changeColor={props.changeColor} />
      </Provider>) : (
      <Provider store={store}>
      <LoadingScreen changeColor={props.changeColor} />
    </Provider>);
  }
  return null;
}

class AppForAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sbColor: "#fff", sbStyle: "dark-content" };
  }

  render() {
    return (
      <SafeAreaProvider>
        <View style={{ height: getStatusBarHeight(), backgroundColor: this.state.sbColor }}>
          <StatusBar translucent backgroundColor={this.state.sbColor} barStyle={this.state.sbStyle} />
        </View>
        <Authenticator hideDefault={true}>
          <CustomLogin />
          <VerifyContact />
          <RequireNewPassword />
          <ForgotPassword />
          <App
            changeColor={(color, style) => {
              this.setState({ sbColor: color });
              this.setState({ sbStyle: style });
            }}
          />
        </Authenticator>
      </SafeAreaProvider>
    );
  }
}

export default AppForAuth;
