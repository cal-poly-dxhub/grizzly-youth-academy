import React from "react";
import { View, Text, TextInput, Dimensions, TouchableOpacity } from "react-native";

export default function NotesEdit(props) {
  const { setNotes, notes } = props.route.params;
  const [noteText, setNoteText] = React.useState("");

  React.useEffect(() => {
    setNoteText(notes);
  }, []);

  return (
    <View
      style={{
        marginTop: Dimensions.get("window").height * 0.1,
        marginLeft: 25,
        marginRight: 25,
        padding: 20,
        borderRadius: 10,
        backgroundColor: "rgb(242,242,242)",
        borderColor: "#6e6e6e",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
          weight: 0,
          height: 5
        },
        shadowRadius: 4,
        elevation: 3,
        shadowOpacity: 0.7
      }}>
      <Text style={{ fontSize: 18, fontWeight: "500" }}>Edit some notes</Text>
      <TextInput
        style={{
          marginTop: 10,
          paddingTop: 10,
          paddingBottom: 10,
          height: 200,
          backgroundColor: "white",
          paddingLeft: 10,
          paddingRight: 10,
          borderRadius: 5
        }}
        placeholder="Notes"
        multiline
        value={noteText}
        onChangeText={(text) => {
          setNoteText(text);
        }}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#0054A4",
            marginLeft: 20,
            marginRight: 20,
            marginTop: 15,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 20,
            paddingRight: 20,
            width: 120,
            alignItems: "center",
            borderRadius: 20
          }}
          onPress={() => {
            setNotes(noteText);
            props.navigation.goBack();
          }}>
          <Text style={{ color: "white", fontWeight: "600", fontSize: 17 }}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
