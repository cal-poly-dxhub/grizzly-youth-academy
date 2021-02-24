import React from "react";
import { FlatList, Text, View, RefreshControl, SectionList, TouchableOpacity } from "react-native";
import { getCompletedActions } from "../../../../../queries/queries";
import { useDispatch } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { updateReduxStateTasks } from "../../../../../queries/queries";

import TodoItem from "./TodoItem";
import moment from "moment";

export default function TodoList(props) {
  const tasks = props.tasks ? props.tasks : [];
  const renderItem = ({ item }) => (
    <TodoItem
      item={item}
      navigation={props.navigation}
      selectedMonthYear={props.selectedMonthYear}
      hideCompleteButton={props.completeButtonStatus === "hide" ? true : false}
    />
  );
  const [refreshing, setRefreshing] = React.useState(false);
  const dispatch = useDispatch();

  const sortState = React.useCallback((state) => {
    state.sort((a, b) => {
      if (moment(a.GoalId) > moment(b.GoalId)) return 1;
      if (moment(a.GoalId) <= moment(b.GoalId)) return -1;
    });
    return state;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {props.children}
      {props.sectioned ? (
        <SectionList
          ref={props.sectionListRef}
          sections={props.processedSectionData}
          keyExtractor={(item, index) => item + index}
          renderItem={renderItem}
          renderSectionHeader={SectionHeader}
          onScrollToIndexFailed={(info) => {
            console.log(info);
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                const { month, year } = props.selectedMonthYear;
                await updateReduxStateTasks(dispatch, month, year);
                setRefreshing(false);
              }}
            />
          }
        />
      ) : (
        <FlatList
          style={{ paddingTop: 5 }}
          data={sortState(tasks)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await getCompletedActions(dispatch);
                setRefreshing(false);
              }}
            />
          }
          keyExtractor={(item, index) => `${index}`}
        />
      )}
      <View style={{ alignSelf: "center", position: "absolute", right: 20, bottom: 20 }}>
        {/* <TouchableOpacity
          style={[
            {
              backgroundColor: "#8a8a8a",
              padding: 10,
              alignSelf: "center",
              borderRadius: 50,
              shadowColor: "#000",
              shadowOffset: {
                weight: 0,
                height: 5
              },
              shadowRadius: 4,
              elevation: 5,
              shadowOpacity: 0.5,
              marginBottom: 8
            }
          ]}
          onPress={() => props.navigation.navigate("Add Action", { selectedMonthYear: props.selectedMonthYear })}>
          <MaterialIcons name="event-note" size={25} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            {
              backgroundColor: "#8a8a8a",
              padding: 10,
              alignSelf: "center",
              borderRadius: 50,
              shadowColor: "#000",
              shadowOffset: {
                weight: 0,
                height: 5
              },
              shadowRadius: 4,
              elevation: 5,
              shadowOpacity: 0.5,
              marginBottom: 8
            }
          ]}
          onPress={() => props.navigation.navigate("Add Action", { selectedMonthYear: props.selectedMonthYear })}>
          <MaterialIcons name="create" size={25} color="white" />
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[
            {
              backgroundColor: "#8B0E04",
              padding: 15,
              alignSelf: "flex-start",
              borderRadius: 50,
              shadowColor: "#000",
              shadowOffset: {
                weight: 0,
                height: 5
              },
              shadowRadius: 4,
              elevation: 5,
              shadowOpacity: 0.5
            }
          ]}
          onPress={() => props.navigation.navigate("Add Action", { selectedMonthYear: props.selectedMonthYear })}>
          <MaterialIcons name="add" size={25} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SectionHeader({ section: { title } }) {
  const overdue = title === "overdue";

  return (
    <View
      style={{
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: "rgb(242, 242, 242)",
        borderBottomWidth: 1,
        borderBottomColor: "#d6d6d6"
      }}>
      <Text style={{ fontWeight: "700", fontSize: 16, color: overdue ? "#9e0505" : "#794400" }}>
        {overdue ? "Overdue" : title}
      </Text>
    </View>
  );
}
