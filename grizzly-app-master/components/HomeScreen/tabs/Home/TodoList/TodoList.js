import React from "react";
import { FlatList, Text, View, RefreshControl, SectionList, TouchableOpacity } from "react-native";
import { API } from "aws-amplify";
import { useDispatch } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { updateReduxStateTasks } from "../../../../../queries/queries";

import TodoItem from "./TodoItem";
import moment from "moment";

export default function TodoList(props) {
  const tasks = props.tasks ? props.tasks : [];
  const renderItem = ({ item }) => (
    <TodoItem item={item} navigation={props.navigation} selectedMonthYear={props.selectedMonthYear} />
  );
  const [refreshing, setRefreshing] = React.useState(false);
  const dispatch = useDispatch();

  const sortState = React.useCallback((state) => {
    const done = state.filter((task) => !task.CompletionDate);
    const notdone = state.filter((task) => task.CompletionDate);

    done.sort((a, b) => {
      if (moment(a.GoalId) > moment(b.GoalId)) return 1;
      if (moment(a.GoalId) <= moment(b.GoalId)) return -1;
    });

    return done.concat(notdone);
  }, []);

  const processSection = React.useCallback((state) => {
    const curTime = moment();
    const output = {};

    state.forEach((task) => {
      if (props.overdue !== false && curTime.isAfter(task.AssignedDate, "day")) {
        if (!output["overdue"]) {
          output["overdue"] = [];
        }
        output["overdue"].push(task);
        return;
      }

      const dueDate = moment(task.AssignedDate).format("YYYY-MM-DD");

      if (!output[dueDate]) {
        output[dueDate] = [];
      }
      output[dueDate].push(task);
    });

    const sectionKeys = Object.keys(output).sort((a, b) => {
      if (a === "overdue" || b === "overdue") {
        return 1;
      }
      return moment(a).isAfter(b, "day") ? 1 : -1;
    });

    const dataOut = sectionKeys.map((key) => {
      return {
        title: key,
        data: output[key]
      };
    });

    return dataOut;
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
                const assignedActionQuery = `
                query MyQuery {
                  ListAssignedActions {
                    Action {
                      Title
                      PointValue
                      MediaURL
                      Id
                      GoalId
                      Description
                    }
                    AssignedDates
                  }
                  ListGoals {
                    Id
                    Name
                  }
                }
                `;

                const assignedAction = await API.graphql({
                  query: assignedActionQuery,
                  authMode: "AMAZON_COGNITO_USER_POOLS"
                });
                const goalsMapping = {};
                const actions = [];

                assignedAction.data.ListGoals.forEach((goalObj) => {
                  goalsMapping[goalObj.Id] = goalObj.Name;
                });
                assignedAction.data.ListAssignedActions.forEach((action) => {
                  action.AssignedDates.forEach((date) => {
                    actions.push({
                      ...action.Action,
                      Goal: goalsMapping[action.Action.GoalId],
                      AssignedDate: date
                    });
                  });
                });
                dispatch({ type: "SET_TASKS", payload: actions });

                setRefreshing(false);
              }}
            />
          }
          keyExtractor={(item, index) => `${index}`}
        />
      )}
      <View style={{ alignSelf: "center", position: "absolute", right: 20, bottom: 20 }}>
        <TouchableOpacity
          style={[
            {
              backgroundColor: "#0054A4",
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
