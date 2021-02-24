import React from "react";
import { View, StyleSheet, Button, Text, TouchableOpacity } from "react-native";

// import { Container, Header, Content, Button, Text } from "native-base";

const style = StyleSheet.create({
  container: {
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 5,
    paddingBottom: 5,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 30,
    alignSelf: "stretch",
    alignItems: "center"
  },
  innerText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10
  }
});

export default function FullwidthButton(props) {
  return (
    <TouchableOpacity style={[style.container, { backgroundColor: "#0054A4" }]} onPress={props.onPress}>
      <Text style={style.innerText}>{props.title}</Text>
    </TouchableOpacity>
  );
}
