import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { API } from "aws-amplify";

export default function AddComponent({ navigation, route }) {
  const [taskcat, setTaskcat] = React.useState([]);
  const [selectedCat, setSelectedCat] = React.useState(undefined);
  const [taskTemp, setTaskTemp] = React.useState([]);

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setLoading(true);

      const query = `
        query MyQuery {
          ListGoals {
            Id
            Name
          }
        }
      `;
      const notif = await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
      if (notif.data.ListGoals) {
        setTaskcat(notif.data.ListGoals);
      }
      setLoading(false);
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      if (selectedCat === undefined) return;
      const query = `
        query MyQuery {
          ListActionOptions(input: {GoalId: ${selectedCat}}) {
            Description
            GoalId
            Id
            MediaURL
            PointValue
            Title
          }
        }
         
      `;

      const taskTemp = await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
      if (taskTemp.data.ListActionOptions) {
        setTaskTemp(taskTemp.data.ListActionOptions);
      }
      setLoading(false);
    })();
  }, [selectedCat]);

  return (
    <ScrollView style={{ padding: 20 }}>
      <DropDownPicker
        items={taskcat.map((item) => {
          return { value: item.Id, label: item.Name };
        })}
        containerStyle={{ height: 40 }}
        placeholder="Select a goal"
        onChangeItem={(item) => {
          setSelectedCat(item.value);
        }}
        style={{ backgroundColor: "#fafafa" }}
        itemStyle={{
          justifyContent: "flex-start"
        }}
        dropDownStyle={{ backgroundColor: "#fafafa" }}
      />
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
                borderBottomWidth: 1,
                marginTop: 15,
                marginBottom: 5,
                borderBottomColor: "#BBB"
              }}></View>
          )}
          {taskTemp.map((item, index) => {
            return <TaskTemplateList key={index} item={item} navigation={navigation} route={route} />;
          })}
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
          {selectedCat && (
            <TaskTemplateList
              item={{ Title: "Custom Action", Description: "Create your own custom action", GoalId: selectedCat }}
              custom={true}
              navigation={navigation}
              route={route}
            />
          )}
        </View>
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function TaskTemplateList(prop) {
  const { item, custom, navigation, route } = prop;

  return (
    <TouchableOpacity
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
          backgroundColor: custom ? "#c3dbdb" : "#6969"
        }}>
        <Text style={{ fontWeight: "700" }}>{item.Title}</Text>
        <Text>{item.Description}</Text>
      </View>
    </TouchableOpacity>
  );
}
