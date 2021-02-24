import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import moment from "moment";

const goalColor = (goalId) => {
  const color = [
    "#0054A4",
    "#006379",
    "#00793F",
    "#617900",
    "#795E00",
    "#794400",
    "#8B0E04",
    "#88048B",
    "#58048B",
    "#04128B",
    "#696969"
  ];

  return color[goalId];
};

const style = StyleSheet.create({
  doneText: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    color: "gray"
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 5,
    marginRight: 10,
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 15
  },
  textContainer: {
    marginLeft: 10
  },
  timeText: {
    color: "rgb(242,242,242)",
    fontWeight: "500",
    fontSize: 14
  },
  titleText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600"
  }
});

export default function TodoItem(props) {
  const { item, navigation } = props;

  return (
    <View>
      <View style={[style.container, { backgroundColor: goalColor(item.GoalId) }]}>
        {!props.hideCompleteButton && (
          <Ionicons
            name={item.CompletionDate ? "ios-checkmark-circle" : "ios-remove-circle-outline"}
            size={30}
            color={"rgb(242,242,242)"}
            onPress={async () => {
              navigation.navigate("Verification", {
                ...item,
                selectedMonthYear: props.selectedMonthYear
              });
            }}
          />
        )}
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            navigation.navigate("Task Details", { activeTask: item, selectedMonthYear: props.selectedMonthYear });
          }}>
          <View style={style.textContainer}>
            <Text style={[style.titleText, item.CompletionDate ? style.doneText : {}]}>{item.Title}</Text>
            <View style={{ flexDirection: "row" }}>
              <Text style={[style.timeText, item.CompletionDate ? style.doneText : {}]}>
                {moment(item.AssignedDate).format("MM/DD/YYYY h:mm a")}
              </Text>
              <Text style={[style.timeText, { flex: 1, textAlign: "right", paddingRight: 20 }]}>{item.Goal}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
