import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  Platform,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Keyboard
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import FullwidthButton from "../../../../UtilityComponents/FullwidthButton";
import moment from "moment";
import { API } from "aws-amplify";
import { useDispatch } from "react-redux";
import StickyKeyboardView from "../../../../UtilityComponents/StickyKeyboardView";
import { Octicons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
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
    marginTop: Dimensions.get("window").height * 0.35,
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

export default function TemplateCreate(prop) {
  const [dateValue, setDateValue] = React.useState(moment());
  const [repeatedDays, setRepeatedDays] = React.useState([false, false, false, false, false, false, false]);
  const [repeatOptions, setRepeatOptions] = React.useState({
    repeat: "Don't repeat",
    occurance: 1,
    type: "Week"
  });

  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 5 }}>
        <Text style={{ fontSize: 17, fontWeight: "600" }}>{prop.route.params.Title}</Text>
        <View style={{ flex: 1, alignItems: "flex-end", alignSelf: "center", paddingRight: 5 }}>
          <TouchableOpacity
            onPress={() => {
              prop.navigation.goBack();
            }}>
            <Ionicons name="ios-close" size={30} color="#8B0E04" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={{ fontSize: 17, paddingBottom: 20 }}>{prop.route.params.Description}</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={styles.editableField}
          onPress={() =>
            prop.navigation.navigate("CalendarEdit", {
              pickerMode: "date",
              dateValue: dateValue,
              setDateValue: setDateValue,
              repeatedDays: repeatedDays,
              setRepeatedDays: setRepeatedDays,
              repeatOptions: repeatOptions,
              setRepeatOptions: setRepeatOptions
            })
          }>
          <Octicons name="calendar" size={12} color="green" />
          <Text style={[{ color: "green" }, styles.editableFieldText]}>{dateValue.format("MM/DD/YY")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editableField}
          onPress={() =>
            prop.navigation.navigate("CalendarEdit", {
              pickerMode: "time",
              dateValue: dateValue,
              setDateValue: setDateValue,
              repeatedDays: repeatedDays,
              setRepeatedDays: setRepeatedDays,
              repeatOptions: repeatOptions,
              setRepeatOptions: setRepeatOptions
            })
          }>
          <Octicons name="clock" size={12} color="green" />
          <Text style={[{ color: "green" }, styles.editableFieldText]}>{dateValue.format("h:mm a")}</Text>
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

              const assignActionOptionMutation = `
                mutation MyMutation {
                  AssignActionOption(input: {
                    ActionOptionId: ${prop.route.params.Id}, 
                    DefaultDate: "${moment(dateValue).format("YYYY-MM-DD")}", 
                    DefaultTime: "${moment(dateValue).format("HH:mm")}", 
                    ${repeatQuery}
                  }) {
                    Action {
                      Id
                    }
                  }
                }`;

              console.log(assignActionOptionMutation);
              await API.graphql({ query: assignActionOptionMutation, authMode: "AMAZON_COGNITO_USER_POOLS" });

              await updateReduxStateTasks(dispatch, month, year);
              prop.navigation.reset({ index: 0, routes: [{ name: "Home" }] });
            }}>
            <Ionicons name="ios-add-circle" size={30} color="#0054A4" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
