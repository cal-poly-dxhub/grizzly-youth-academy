import React from "react";
import { TouchableOpacity, TouchableHighlight } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { API } from "aws-amplify";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { createStackNavigator } from "@react-navigation/stack";
import moment from "moment";

import MonthComponent from "./MonthView/MonthView";
import UpcomingComponent from "./UpcomingView/UpcomingView";
import { useDispatch } from "react-redux";
import ItemDetail from "./TodoList/ItemDetail";
import OverdueView from "./UpcomingView/OverdueView";

import AddComponent from "./CreateViews/AddTask";
import CustomTask from "./CreateViews/CustomTask";
import TemplateCreate from "./CreateViews/TemplateCreate";
import CalendarEdit from "./CreateViews/CalendarEdit";
import NotesEdit from "./CreateViews/NotesEdit";
import Verification from "./TodoList/Verification";

const Tab = createMaterialTopTabNavigator();
const StackNavigator = createStackNavigator();

export default function HomeTab() {
  return (
    <StackNavigator.Navigator mode="modal">
      <StackNavigator.Screen name="Home" component={HomeComponent} />
      <StackNavigator.Screen name="Add Action" component={AddComponent} />
      <StackNavigator.Screen
        name="New Custom Task"
        component={CustomTask}
        options={{ headerShown: false, cardStyle: { backgroundColor: "rgba(110, 110, 110, 0)" } }}
      />
      <StackNavigator.Screen
        name="Template Create"
        component={TemplateCreate}
        options={{ headerShown: false, cardStyle: { backgroundColor: "rgba(110, 110, 110, 0)" } }}
      />
      <StackNavigator.Screen
        name="Task Details"
        component={ItemDetail}
        options={{ headerShown: false, cardStyle: { borderRadius: 30 } }}
      />
      <StackNavigator.Screen
        name="CalendarEdit"
        component={CalendarEdit}
        options={{ headerShown: false, cardStyle: { backgroundColor: "rgba(110, 110, 110, 0)" } }}
      />
      <StackNavigator.Screen
        name="NotesEdit"
        component={NotesEdit}
        options={{ headerShown: false, cardStyle: { backgroundColor: "rgba(110, 110, 110, 0)" } }}
      />
      <StackNavigator.Screen
        name="Verification"
        component={Verification}
        options={{ headerShown: false, cardStyle: { backgroundColor: "rgba(110, 110, 110, 0)" } }}
      />
    </StackNavigator.Navigator>
  );
}

function HomeComponent(props) {
  return <MonthComponent navigation={props.navigation} />;

  return (
    <Tab.Navigator>
      <Tab.Screen name="MONTH" component={MonthComponent} />
      <Tab.Screen name="COMPLETED" component={OverdueView} />
    </Tab.Navigator>
  );
}
