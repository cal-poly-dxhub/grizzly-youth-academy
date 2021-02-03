import React from "react";
import { View, TextInput } from "react-native";

export default function FullwidthTextfield(props) {
  return (
    <View style={{ alignSelf: "stretch", marginTop: 15 }}>
      <TextInput
        style={{
          height: 40,
          borderColor: "gray",
          paddingLeft: 20,
          paddingRight: 20,
          borderWidth: 1,
          borderRadius: 40
        }}
        {...props}
      />
    </View>
  );
}
