import React from "react";
import { View, ActivityIndicator } from "react-native";
import moment from "moment";
import { CalendarProvider, ExpandableCalendar } from "react-native-calendars";
import TodoList from "../TodoList/TodoList";
import { useSelector, useDispatch } from "react-redux";
import { Entypo } from "@expo/vector-icons";
import { updateReduxStateTasks } from "../../../../../queries/queries";

export default function CalendarComponent(props) {
  const tasks = useSelector((state) => state.tasks);
  const dispatch = useDispatch();
  const sectionListRef = React.useRef(null);

  const [selectedMonthYear, setSelectedMonthYear] = React.useState({
    month: moment().format("M"),
    year: moment().format("YYYY")
  });
  const [selectedDate, setSelectedDate] = React.useState(moment().format("YYYY-MM-DD"));
  const [markedDates, setMarkedDates] = React.useState({});
  const [processedSection, setProcessedSection] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const markedDatesObj = {};

    tasks.forEach((item) => {
      const date = moment(item.AssignedDate).format("YYYY-MM-DD");
      if (!markedDatesObj[date]) {
        markedDatesObj[date] = {};
      }
      markedDatesObj[date]["marked"] = true;
    });
    setMarkedDates(markedDatesObj);
  }, [tasks]);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      if (selectedMonthYear.year && selectedMonthYear.month)
        await updateReduxStateTasks(dispatch, selectedMonthYear.month, selectedMonthYear.year);
      setLoading(false);
    })();
  }, [selectedMonthYear]);

  React.useEffect(() => {
    const res = processSection(sortState(tasks));
    setProcessedSection(res);
  }, [tasks]);

  const addSelectedDate = () => {
    const newObj = JSON.parse(JSON.stringify(markedDates));
    if (newObj[selectedDate] === undefined) {
      newObj[selectedDate] = {};
    }
    newObj[selectedDate]["selected"] = true;
    return newObj;
  };

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
    const output = {};

    state.forEach((task) => {
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
    <View style={{ flexDirection: "column", flex: 1 }}>
      <CalendarProvider
        date={selectedDate}
        onDateChanged={(date) => {
          setSelectedDate(date);

          const processMap = processedSection.map((v) => v.title);
          if (
            sectionListRef &&
            sectionListRef.current &&
            sectionListRef.current.scrollToLocation &&
            processMap.includes(date)
          ) {
            sectionListRef.current.scrollToLocation({
              sectionIndex: processMap.indexOf(date),
              itemIndex: 0
            });
          }
        }}
        onMonthChange={(month) => {
          setSelectedMonthYear(month);
        }}
        disabledOpacity={0.8}>
        <ExpandableCalendar
          initialPosition={ExpandableCalendar.positions.CLOSED}
          theme={{
            selectedDayBackgroundColor: "#0054A4",
            monthTextColor: "#794400"
          }}
          firstDay={1}
          markedDates={addSelectedDate()}
          renderArrow={(d) =>
            d === "left" ? (
              <Entypo name="chevron-left" size={16} color="#794400" />
            ) : (
              <Entypo name="chevron-right" size={16} color="#794400" />
            )
          }
        />
        <View style={{ flex: 1 }}>
          {loading ? (
            <View style={{ flex: 1, justifyContent: "center" }}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <TodoList
              style={{ flex: 1 }}
              tasks={tasks}
              navigation={props.navigation}
              sectioned={true}
              overdue={false}
              sectionListRef={sectionListRef}
              processedSectionData={processedSection}
              selectedMonthYear={selectedMonthYear}
            />
          )}
        </View>
      </CalendarProvider>
    </View>
  );
}
