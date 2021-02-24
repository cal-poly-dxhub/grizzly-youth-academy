import React from "react";
import { View, ActivityIndicator } from "react-native";
import TodoList from "../TodoList/TodoList";
import { useSelector, useDispatch } from "react-redux";
import { getCompletedActions } from "../../../../../queries/queries";

export default function CompletedView(props) {
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const completedTasksRdx = useSelector((state) => state.completedTasks);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      await getCompletedActions(dispatch);
      setLoading(false);
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <TodoList
          tasks={completedTasksRdx}
          navigation={props.navigation}
          sectioned={false}
          style={{ flex: 1 }}
          completeButtonStatus={"hide"}
        />
      )}
    </View>
  );
}
