import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import TodoList from "../TodoList/TodoList";
import { useSelector } from "react-redux";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function UpcomingView(props) {
  const tasks = useSelector((state) => state.tasks);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* <Text style={{ fontSize: 18, fontWeight: "700", paddingLeft: 10, paddingTop: 10, color: "black" }}>Overdue</Text>
      <Text style={{ fontSize: 18, fontWeight: "700", paddingLeft: 10, paddingTop: 10, color: "black" }}>Today</Text>
    <Text style={{ fontSize: 18, fontWeight: "700", paddingLeft: 10, paddingTop: 10, color: "black" }}>Upcoming</Text> */}
        <TodoList
          tasks={tasks.filter((t) => moment(t.AssignedDate).isSameOrAfter(moment(), "day"))}
          navigation={props.navigation}
          sectioned={true}
        />
      </View>
    </SafeAreaView>
  );
}
