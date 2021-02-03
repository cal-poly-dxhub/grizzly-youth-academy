import React from "react";
import { View, StyleSheet, Button, Text, TouchableOpacity } from "react-native";
// import { Container, Header, Content, Button, Text } from "native-base";

const style = StyleSheet.create({
  container: {
    paddingLeft: 30,
    paddingRight: 30,
    borderRadius: 30
  },
  innerText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10
  }
});

export default function InheritedWidthButton(props) {
  return (
    <TouchableOpacity style={[style.container, { backgroundColor: props.color }]} onPress={props.onPress}>
      <Text style={style.innerText}>{props.title}</Text>
    </TouchableOpacity>
  );
}
