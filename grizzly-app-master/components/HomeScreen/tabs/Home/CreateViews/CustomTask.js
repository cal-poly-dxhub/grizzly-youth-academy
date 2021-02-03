import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Dimensions,
  StyleSheet
} from "react-native";
import moment from "moment";
import { useDispatch } from "react-redux";
import { API } from "aws-amplify";
import { Octicons } from "@expo/vector-icons";
import { SimpleLineIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import StickyKeyboardView from "../../../../UtilityComponents/StickyKeyboardView";
import { TouchableOpacity } from "react-native-gesture-handler";
import { updateReduxStateTasks } from "../../../../../queries/queries";

const styles = StyleSheet.create({
  editableField: {
    borderWidth: 1,
    borderRadius: 5,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 8,
    paddingRight: 8,
    borderColor: "#a1a1a1",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10
  },
  editableFieldText: {
    paddingLeft: 5,
    fontSize: 16
  },
  container: {
    backgroundColor: "rgb(242,242,242)",
    borderRadius: 10,
    width: Dimensions.get("window").width - 50,
    marginLeft: 25,
    marginRight: 25,
    paddingTop: 5,
    paddingBottom: 15,
    paddingLeft: 10,
    paddingRight: 10,
    borderColor: "rgba(0,0,0,0.2)",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      weight: 0,
      height: 5
    },
    shadowRadius: 4,
    elevation: 3,
    shadowOpacity: 0.7
  },
  button: { marginTop: 80 }
});

const getDate = (date) => {
  const time = date.toLocaleString().split(", ")[1];
  const timesplit = time.split(" ");
  const timepart = timesplit[0];
  const ampmpart = timesplit[1];

  return timepart.split(":").slice(0, 2).join(":") + " " + ampmpart;
};

export default function CustomTask(prop) {
  const [title, setTitle] = React.useState("");
  const [dateValue, setDateValue] = React.useState(moment());
  const [notes, setNotes] = React.useState("");
  const [repeatedDays, setRepeatedDays] = React.useState([false, false, false, false, false, false, false]);
  const [repeatOptions, setRepeatOptions] = React.useState({
    repeat: "Don't repeat",
    occurance: 1,
    type: "Week"
  });

  const dispatch = useDispatch();
  const taskTitleRef = React.useRef(null);

  return (
    <StickyKeyboardView focusTextInput={taskTitleRef} navigation={prop.navigation}>
      <View style={styles.container}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 5 }}>
          <Text style={{ fontSize: 17, fontWeight: "600" }}>Create a custom task</Text>
          <View style={{ flex: 1, alignItems: "flex-end", alignSelf: "center", paddingRight: 5 }}>
            <TouchableOpacity
              onPress={() => {
                prop.navigation.goBack();
              }}>
              <Ionicons name="ios-close" size={30} color="#8B0E04" />
            </TouchableOpacity>
          </View>
        </View>
        <TextInput
          placeholder="Add a title"
          style={{ height: 50, fontSize: 17 }}
          ref={taskTitleRef}
          onChangeText={(txt) => {
            setTitle(txt);
          }}
        />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.editableField}
            onPress={() => {
              Keyboard.dismiss();
              prop.navigation.navigate("CalendarEdit", {
                pickerMode: "date",
                dateValue: dateValue,
                setDateValue: setDateValue,
                repeatedDays: repeatedDays,
                setRepeatedDays: setRepeatedDays,
                repeatOptions: repeatOptions,
                setRepeatOptions: setRepeatOptions
              });
            }}>
            <Octicons name="calendar" size={12} color="green" />
            <Text style={[{ color: "green" }, styles.editableFieldText]}>{dateValue.format("MM/DD/YY")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editableField}
            onPress={() => {
              Keyboard.dismiss();
              prop.navigation.navigate("CalendarEdit", {
                pickerMode: "time",
                dateValue: dateValue,
                setDateValue: setDateValue,
                repeatedDays: repeatedDays,
                setRepeatedDays: setRepeatedDays,
                repeatOptions: repeatOptions,
                setRepeatOptions: setRepeatOptions
              });
            }}>
            <Octicons name="clock" size={12} color="green" />
            <Text style={[{ color: "green" }, styles.editableFieldText]}>{dateValue.format("h:mm a")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editableField}
            onPress={() => {
              Keyboard.dismiss();
              prop.navigation.navigate("NotesEdit", { setNotes: setNotes, notes: notes, taskTitleRef: taskTitleRef });
            }}>
            <SimpleLineIcons name="notebook" size={14} color="#0059ff" />
            <Text style={[{ color: "#0059ff" }, styles.editableFieldText]}>{notes === "" ? "Add" : "Edit"} notes</Text>
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <TouchableOpacity
              onPress={async () => {
                const { month, year } = prop.route.params.selectedMonthYear;

                let daysOfWeekString = "";
                repeatedDays.forEach((m, i) => {
                  if (m) {
                    const days = ["M", "T", "W", "H", "F", "S", "D"];
                    daysOfWeekString += days[i];
                  }
                });

                const repeatQuery =
                  repeatOptions.repeat === "Repeat"
                    ? repeatOptions.type === "Week"
                      ? `DefaultDaysOfWeek: "${daysOfWeekString}", 
            DefaultWeeklyFrequency: ${repeatOptions.occurance}, `
                      : `DefaultDayOfMonth: ${dateValue.date()},
                DefaultMonthlyFrequency: ${repeatOptions.occurance} `
                    : "";

                const customActionMutation = `
                mutation MyMutation {
                  AssignCustomAction(input: {
                      Title: "${title}", 
                      Description: "${notes}", 
                      GoalId: ${prop.route.params.CategoryId}, 
                      DefaultTime: "${moment(dateValue).format("HH:mm")}", 
                      DefaultDate: "${moment(dateValue).format("YYYY-MM-DD")}", 
                      ${repeatQuery}
                    }) {
                    Action {
                      Id
                    }
                  }
                }                
                `;

                console.log(customActionMutation);
                await API.graphql({ query: customActionMutation, authMode: "AMAZON_COGNITO_USER_POOLS" });
                await updateReduxStateTasks(dispatch, month, year);
                prop.navigation.reset({ index: 0, routes: [{ name: "Home" }] });
              }}>
              <Ionicons name="ios-add-circle" size={30} color="#0054A4" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </StickyKeyboardView>
  );
}
