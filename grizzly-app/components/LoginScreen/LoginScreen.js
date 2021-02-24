import React, { useState } from "react";
import { View, TextInput, StyleSheet, Image, Text } from "react-native";
import { useDispatch } from "react-redux";
import GrizzlyLandingImage from "../../assets/grizzlysignin.png";
import "react-native-gesture-handler";

import InheritedWidthButton from "../UtilityComponents/InheritedWidthButton";
import FullwidthTextfield from "../UtilityComponents/FullwidthTextfield";
import { SET_AUTH_STATE, setAuthState } from "../../redux";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#e5e4e5",
    alignSelf: "stretch",
    alignItems: "center"
  },
  button: { marginTop: 80 }
});

export default function LoginScreen(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={GrizzlyLandingImage} />
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
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
        <FullwidthTextfield
          placeholder="Enter password"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <View style={styles.button}>
        <InheritedWidthButton
          title="LOG IN"
          color="#ff5b29"
          onPress={() => dispatch(setAuthState(true))}
        />
      </View>
    </View>
  );
}
