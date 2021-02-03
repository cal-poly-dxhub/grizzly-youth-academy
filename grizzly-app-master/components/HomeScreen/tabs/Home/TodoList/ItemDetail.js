import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";

let styles = StyleSheet.create({
  modalView: {
    flex: 1,
    padding: 25
  },
  modalText: {
    marginBottom: 15,
    textAlign: "left"
  },
  dueDateSelector: {
    marginTop: 10,
    fontSize: 12,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "green",
    color: "green",
    alignSelf: "flex-start",
    padding: 5
  }
});

export default function ItemDetail(props) {
  const { navigation, route } = props;
  const { activeTask } = route.params;

  return (
    <View style={styles.modalView}>
      <View style={{ flexDirection: "row", marginBottom: 10, alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16 }}>{activeTask.Goal}</Text>
        </View>
        <View>
          <MaterialCommunityIcons
            name="close-circle-outline"
            size={30}
            color="grey"
            onPress={() => {
              navigation.goBack();
            }}
          />
        </View>
      </View>
      <View>
        <Text style={[{ fontWeight: "600", fontSize: 24 }]}>{activeTask.Title}</Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dueDateSelector}>{moment(activeTask.AssignedDate).format("MM/DD/YYYY hh:mm a")}</Text>
        </View>
        <Feather style={{ alignSelf: "center", paddingTop: 10 }} name="more-horizontal" size={27} color="black" />
      </View>
      <View
        style={{
          borderBottomColor: "#8f8f8f",
          borderBottomWidth: 1,
          marginTop: 15,
          marginBottom: 10
        }}
      />
      <Text style={{ fontWeight: "700" }}>Description</Text>
      <Text style={[styles.modalText]}>{activeTask.Description}</Text>
    </View>
  );
}
