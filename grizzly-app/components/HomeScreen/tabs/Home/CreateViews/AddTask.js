import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from "react-native";
import { MenuProvider } from "react-native-popup-menu";
import RNPickerSelect from "react-native-picker-select";

import { ListActionOptions, ListGoals, DeleteActionOption } from "../../../../../queries/queries";

export default function AddComponent({ navigation, route }) {
  const [taskcat, setTaskcat] = React.useState([]);
  const [selectedCat, setSelectedCat] = React.useState(null);
  const [taskTemp, setTaskTemp] = React.useState([]);

  const [loading, setLoading] = React.useState(false);

  const updateActionOption = React.useCallback(async () => {
    setLoading(true);
    if (selectedCat === null) {
      setLoading(false);
      setTaskTemp([]);
      return;
    }
    const taskTemp = await ListActionOptions(selectedCat);
    if (taskTemp) {
      setTaskTemp(taskTemp);
    }
    setLoading(false);
  }, [selectedCat]);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const goals = await ListGoals();
      if (goals) setTaskcat(goals);
      setLoading(false);
    })();
  }, []);

  React.useEffect(() => {
    updateActionOption();
  }, [selectedCat]);

  return (
    <MenuProvider>
      <ScrollView style={{ padding: 20 }}>
        <TouchableOpacity style={{ borderWidth: 1, padding: 10, borderColor: "#696969", borderRadius: 7 }}>
          <RNPickerSelect
            placeholder={{
              label: "Select a goal...",
              value: null,
              color: "#FFF"
            }}
            value={selectedCat}
            onValueChange={(value) => {
              setSelectedCat(value);
            }}
            items={taskcat.map((item) => {
              return {
                value: item.Id,
                label: item.Name
              };
            })}
          />
        </TouchableOpacity>
        {loading ? (
          <View
            style={{
              flex: 1,
              height: Dimensions.get("window").height / 2,
              justifyContent: "center",
              alignItems: "center"
            }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <View>
            {taskTemp.length !== 0 && (
              <View
                style={{
                  flex: 1,
                  marginTop: 15,
                  marginBottom: 5
                }}></View>
            )}
            {selectedCat && (
              <TaskTemplateList
                item={{ Title: "Custom Action", Description: "Create your own custom action", GoalId: selectedCat }}
                custom={true}
                navigation={navigation}
                route={route}
              />
            )}
            {selectedCat && (
              <View
                style={{
                  flex: 1,
                  borderBottomWidth: 1,
                  marginTop: 15,
                  marginBottom: 5,
                  borderBottomColor: "#BBB"
                }}></View>
            )}
            {taskTemp.map((item, index) => {
              return (
                <TaskTemplateList
                  key={index}
                  item={item}
                  navigation={navigation}
                  route={route}
                  updateActionOption={updateActionOption}
                />
              );
            })}
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </MenuProvider>
  );
}

function TaskTemplateList(prop) {
  const { item, custom, navigation, route } = prop;

  return (
    <TouchableOpacity
      onLongPress={() => {
        if (prop.updateActionOption === undefined) return;
        Alert.alert("Deleting Action Option", `Are you sure you want to delete "${item.Title}" action option?`, [
          {
            text: "Cancel",
            onPress: () => {},
            style: "cancel"
          },
          {
            text: "Delete",
            onPress: async () => {
              await DeleteActionOption(item.Id);
              prop.updateActionOption();
            }
          }
        ]);
      }}
      onPress={() => {
        if (custom)
          navigation.navigate("New Custom Task", {
            CategoryId: item.GoalId,
            selectedMonthYear: route.params.selectedMonthYear
          });
        else {
          navigation.navigate("Template Create", {
            ...item,
            selectedMonthYear: route.params.selectedMonthYear
          });
        }
      }}>
      <View
        style={{
          padding: 10,
          marginTop: 10,
          marginBottom: 5,
          borderRadius: 10,
          backgroundColor: custom ? "#c3dbdb" : "#6969",
          flexDirection: "row",
          alignItems: "center"
        }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700" }}>{item.Title}</Text>
          <Text>{decodeURI(item.Description)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
