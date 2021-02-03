import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import GrizzlyLandingImage from "../../assets/grizzlysignin.png";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SignIn } from "aws-amplify-react-native";
import "react-native-gesture-handler";

import FullwidthTextfield from "../UtilityComponents/FullwidthTextfield";
import FullwidthButton from "../UtilityComponents/FullwidthButton";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e5e4e5",
    alignItems: "center",
    justifyContent: "center"
  }
});

export default class CustomLogin extends SignIn {
  constructor(props) {
    super(props);

    this._validAuthStates = ["signIn", "signedOut"];
    this.state = {
      username: null,
      password: null,
      error: null
    };
  }

  showComponent(theme) {
    if (this.props.authState !== "signIn") {
      return null;
    }

    return (
      <KeyboardAvoidingView behavior={Platform && Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableWithoutFeedback
          onPress={() => {
            if (Platform && (Platform.OS === "ios" || Platform.OS === "android")) {
              Keyboard.dismiss();
            }
          }}>
          <View style={styles.container}>
            <Image source={GrizzlyLandingImage} />
            <View
              style={{
                alignSelf: "stretch",
                marginLeft: 30,
                marginRight: 30
              }}>
              <FullwidthTextfield
                placeholder="Enter username"
                autoCapitalize="none"
                autoCorrect={false}
                value={this.state.username}
                onChangeText={(text) => this.setState({ username: text })}
              />
              <FullwidthTextfield
                placeholder="Enter password"
                secureTextEntry={true}
                value={this.state.password}
                onChangeText={(text) => this.setState({ password: text })}
              />
            </View>
            <View style={{ height: 100, justifyContent: "center" }}>
              {this.state.error && (
                <Text style={{ color: "red" }}>
                  <Ionicons name="ios-warning" color="red" size={16} /> {this.state.error}
                </Text>
              )}
            </View>
            <View>
              <FullwidthButton
                title="LOG IN"
                color="#ff5b29"
                onPress={() => {
                  if (!this.state.username || !this.state.password) {
                    this.setState({ error: "Missing username or password" });
                    return;
                  }
                  super.signIn();
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }
}
