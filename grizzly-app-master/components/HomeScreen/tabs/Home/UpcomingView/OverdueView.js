import React from "react";
import { View } from "react-native";
import TodoList from "../TodoList/TodoList";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";

const updateReduxStateTasks = async (dispatch, month, year) => {
  const assignedActionQuery = `
  query MyQuery {
    ListAssignedActions(month: ${month}, year: ${year}) {
      Action {
        Title
        PointValue
        MediaURL
        Id
        GoalId
        Description
      }
      AssignedDates
      CompletedDates
      TemplateId
    }
    ListGoals {
      Id
      Name
    }
  }
  `;

  const assignedAction = await API.graphql({ query: assignedActionQuery, authMode: "AMAZON_COGNITO_USER_POOLS" });
  const goalsMapping = {};
  const actions = [];

  console.log(assignedAction);
  assignedAction.data.ListGoals.forEach((goalObj) => {
    goalsMapping[goalObj.Id] = goalObj.Name;
  });
  assignedAction.data.ListAssignedActions.forEach((action) => {
    action.CompletedDates.forEach((date) => {
      const ret = {
        ...action.Action,
        Goal: goalsMapping[action.Action.GoalId],
        AssignedDate: date,
        templateId: action.TemplateId
      };
      actions.push(ret);
    });
  });
  dispatch({ type: "SET_TASKS", payload: actions });
};

export default function OverdueView(props) {
  const completedTasks = useSelector((state) => state.completedTasks);

  return (
    <View style={{ flex: 1 }}>
      {/* <Text style={{ fontSize: 18, fontWeight: "700", paddingLeft: 10, paddingTop: 10, color: "black" }}>Overdue</Text>
      <Text style={{ fontSize: 18, fontWeight: "700", paddingLeft: 10, paddingTop: 10, color: "black" }}>Today</Text>
      <Text style={{ fontSize: 18, fontWeight: "700", paddingLeft: 10, paddingTop: 10, color: "black" }}>Upcoming</Text> */}
      <TodoList tasks={completedTasks} navigation={props.navigation} sectioned={true} />
    </View>
  );
}
