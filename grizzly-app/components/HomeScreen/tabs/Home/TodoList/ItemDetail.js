import React from "react";
import { Linking, View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from "react-native-popup-menu";
import moment from "moment";
import { useDispatch } from "react-redux";
import { API } from "aws-amplify";
import { updateReduxStateTasks } from "../../../../../queries/queries";

let styles = StyleSheet.create({
  modalView: {
    flex: 1,
    padding: 25
  },
  modalText: {
    marginBottom: 15,
    textAlign: "left"
  },
  dueDateSelector: {
    marginTop: 10,
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "green",
    color: "green",
    alignSelf: "flex-start",
    padding: 5
  }
});

export default function ItemDetail(props) {
  const [loading, setLoading] = React.useState(false);
  const { navigation, route } = props;
  const { activeTask } = route.params;
  const dispatch = useDispatch();

  const [ready, setReady] = React.useState(false);
  const [doneChange, setDoneChange] = React.useState(false);
  const [dateValue, setDateValue] = React.useState(moment());
  const [repeatedDays, setRepeatedDays] = React.useState([false, false, false, false, false, false, false]);
  const [repeatOptions, setRepeatOptions] = React.useState({
    repeat: "Don't repeat",
    occurance: 1,
    type: "Week"
  });

  React.useEffect(() => {
    (async () => {
      if (ready === false) return;
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
          UpdateActionSchedule(input: {
            TemplateId: ${activeTask.templateId}, 
            DefaultDate: "${moment(dateValue).format("YYYY-MM-DD")}", 
            DefaultTime: "${moment(dateValue).format("HH:mm")}", 
            ${repeatQuery}
          }) {
            Action {
              Id
            }
          }
        }`;
      await API.graphql({ query: assignActionOptionMutation, authMode: "AMAZON_COGNITO_USER_POOLS" });
      await updateReduxStateTasks(dispatch, route.params.selectedMonthYear.month, route.params.selectedMonthYear.year);
    })();
  }, [doneChange]);

  const updateTemplateId = React.useCallback(
    async (templateId) => {
      const query = `query MyQuery {
        GetAssignedSchedule(TemplateId: ${templateId}) {
          DefaultTime
          DefaultDate
          DefaultDaysOfWeek
          DefaultWeeklyFrequency
          DefaultDayOfMonth
          DefaultMonthlyFrequency
        }
      }`;
      const ret = await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
      const schedule = ret.data.GetAssignedSchedule;

      setDateValue(moment(activeTask.AssignedDate));
      if (schedule.DefaultDaysOfWeek) {
        setRepeatOptions({
          ...repeatOptions,
          repeat: "Repeat",
          type: "Week"
        });
        const repeat = [false, false, false, false, false, false, false];
        const mapping = "MTWHFSD".split("");
        mapping.forEach((value, idx) => {
          if (schedule.DefaultDaysOfWeek.includes(value)) {
            repeat[idx] = true;
          }
        });
        setRepeatedDays(repeat);
      } else if (schedule.DefaultDayOfMonth) {
        setRepeatOptions({
          ...repeatOptions,
          repeat: "Repeat",
          type: "Month"
        });
      }
      setReady(true);
    },
    [activeTask]
  );

  React.useEffect(() => {
    const { templateId } = activeTask;
    updateTemplateId(templateId);
  }, [activeTask]);

  return (
    <MenuProvider>
      {loading && (
        <View
          style={{
            position: "absolute",
            height: Dimensions.get("window").height,
            alignSelf: "center",
            justifyContent: "center"
          }}>
          <ActivityIndicator size="large" />
        </View>
      )}
      <View style={styles.modalView}>
        <View style={{ flexDirection: "row", marginBottom: 10, alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16 }}>{activeTask.Goal}</Text>
          </View>
          <View>
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={30}
              color="grey"
              onPress={() => {
                navigation.goBack();
              }}
            />
          </View>
        </View>
        <View>
          <Text style={[{ fontWeight: "600", fontSize: 24 }]}>{activeTask.Title}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ marginRight: 10 }}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("CalendarEdit", {
                  pickerMode: "date",
                  dateValue: dateValue,
                  setDateValue: setDateValue,
                  repeatedDays: repeatedDays,
                  setRepeatedDays: setRepeatedDays,
                  repeatOptions: repeatOptions,
                  setRepeatOptions: setRepeatOptions,
                  setDoneChange: () => {
                    setDoneChange(!doneChange);
                  }
                });
              }}>
              <Text style={styles.dueDateSelector}>{dateValue.format("MM/DD/YYYY")}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("CalendarEdit", {
                  pickerMode: "time",
                  dateValue: dateValue,
                  setDateValue: setDateValue,
                  repeatedDays: repeatedDays,
                  setRepeatedDays: setRepeatedDays,
                  repeatOptions: repeatOptions,
                  setRepeatOptions: setRepeatOptions,
                  setDoneChange: () => {
                    setDoneChange(!doneChange);
                  }
                });
              }}>
              <Text style={styles.dueDateSelector}>{dateValue.format("hh:mm a")}</Text>
            </TouchableOpacity>
          </View>
          <Menu>
            <MenuTrigger>
              <Feather style={{ alignSelf: "center", paddingTop: 10 }} name="more-horizontal" size={27} color="black" />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption
                style={{ padding: 15, paddingBottom: 12 }}
                onSelect={async () => {
                  if (loading === true) return;
                  setLoading(true);
                  const deleteDateMutation = `mutation MyMutation {
                    DeleteAssignedActionDate(input: {
                      TemplateId: ${route.params.activeTask.templateId}, 
                      AssignmentDateTime: "${route.params.activeTask.AssignedDate}"}) {
                      Action {
                        Id
                      }
                    }
                  }`;

                  await API.graphql({ query: deleteDateMutation, authMode: "AMAZON_COGNITO_USER_POOLS" });
                  await updateReduxStateTasks(
                    dispatch,
                    route.params.selectedMonthYear.month,
                    route.params.selectedMonthYear.year
                  );
                  navigation.navigate("Calendar");
                  setLoading(false);
                }}
                text="Delete only this action"
              />
              {!activeTask.nonRepeating && (
                <MenuOption
                  style={{ padding: 15, paddingTop: 12 }}
                  onSelect={async () => {
                    if (loading === true) return;
                    setLoading(true);
                    const deleteDateMutation = `
                  mutation MyMutation {
                    DeleteActionFromTemplate(input: {TemplateId: ${activeTask.templateId}}) {
                      Action {
                        Id
                      }
                    }
                  }`;

                    await API.graphql({ query: deleteDateMutation, authMode: "AMAZON_COGNITO_USER_POOLS" });
                    await updateReduxStateTasks(
                      dispatch,
                      route.params.selectedMonthYear.month,
                      route.params.selectedMonthYear.year
                    );
                    navigation.navigate("Calendar");
                    setLoading(false);
                  }}>
                  <Text style={{ color: "red" }}>Remove all repeats</Text>
                </MenuOption>
              )}
            </MenuOptions>
          </Menu>
        </View>
        <View
          style={{
            borderBottomColor: "#8f8f8f",
            borderBottomWidth: 1,
            marginTop: 15,
            marginBottom: 10
          }}
        />
        <Text style={{ fontWeight: "700" }}>Media Link</Text>
        <Text style={[styles.modalText]}>{activeTask.MediaURL}</Text>
        {activeTask.MediaURL && (
          <TouchableOpacity style={{ backgroundColor: "#0054A4", padding: 10, borderRadius: 10, marginBottom: 10 }}>
            <Text
              style={{ color: "white" }}
              onPress={() => {
                Linking.openURL(activeTask.MediaURL);
              }}>
              Visit provided link
            </Text>
          </TouchableOpacity>
        )}
        <Text style={{ fontWeight: "700" }}>Description</Text>
        <Text style={[styles.modalText]}>{decodeURI(activeTask.Description)}</Text>
      </View>
    </MenuProvider>
  );
}
