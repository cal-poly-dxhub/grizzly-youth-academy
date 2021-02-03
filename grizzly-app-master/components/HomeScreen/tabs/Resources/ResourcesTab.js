import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";

import { useSelector } from "react-redux";
import FullwidthButton from "../../../UtilityComponents/FullwidthButton";
import { createStackNavigator } from "@react-navigation/stack";
import { ScrollView } from "react-native-gesture-handler";
import { API } from "aws-amplify";

const StackNavigator = createStackNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
    marginLeft: 30,
    marginRight: 30,
    top: 50
  },
  title: {
    marginBottom: 30,
    marginLeft: 3,
    fontSize: 30
  }
});

export default function ResourcesTab() {
  return (
    <StackNavigator.Navigator mode="modal">
      <StackNavigator.Screen name="Resources" component={ResourceComponent} />
      <StackNavigator.Screen name="Type" component={ResourceDetails} />
      <StackNavigator.Screen name="Resource" component={ResourceView} />
    </StackNavigator.Navigator>
  );
}

function ResourceComponent({ navigation }) {
  const [resources, setResources] = React.useState([]);
  const cadetInfo = useSelector((state) => state.cadetInfo);

  React.useEffect(() => {
    (async () => {
      const query = `
        query MyQuery {
          ListResourceCategories {
            Id
            Name
          }
        }
      `;

      const resources = await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
      if (resources.data.ListResourceCategories) {
        setResources(resources.data.ListResourceCategories);
      }
    })();
  }, []);

  return (
    <ScrollView style={{ paddingLeft: 10, paddingRight: 10 }}>
      <Text style={{ fontWeight: "600", fontSize: 18, paddingTop: 20 }}>SOS Resources</Text>
      {cadetInfo.Staff &&
        cadetInfo.Staff.map((staffInfo, index) => (
          <TouchableOpacity
            key={index}
            style={{ backgroundColor: "#8B0E04", padding: 15, borderRadius: 15, marginTop: 10 }}
            onPress={() => {
              Linking.openURL(`tel:+${staffInfo.Phone}`);
            }}>
            <Text style={{ fontSize: 16, color: "white", fontWeight: "600" }}>
              Call {staffInfo.StaffType} {staffInfo.FirstName} {staffInfo.LastName}
            </Text>
          </TouchableOpacity>
        ))}
      <TouchableOpacity
        style={{ backgroundColor: "#8B0E04", padding: 15, borderRadius: 15, marginTop: 10 }}
        onPress={() => {
          Linking.openURL(`tel:+${16265370187}`);
        }}>
        <Text style={{ fontSize: 16, color: "white", fontWeight: "600" }}>Call national crisis hotline</Text>
      </TouchableOpacity>
      <Text style={{ fontWeight: "600", fontSize: 18, paddingTop: 20 }}>Goal resources</Text>
      <View />
      {resources.map((item) => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Type", item)}
          key={item.Id}
          style={{ backgroundColor: "#0054A4", padding: 15, borderRadius: 15, marginTop: 10 }}>
          <Text style={{ fontSize: 16, color: "white", fontWeight: "600" }}>
            {item.Name.charAt(0).toUpperCase() + item.Name.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
      <Text style={{ fontWeight: "600", fontSize: 18, paddingTop: 20 }}>Make the app better</Text>
      <TouchableOpacity style={{ backgroundColor: "#794400", padding: 15, borderRadius: 15, marginTop: 10 }}>
        <Text
          style={{ fontSize: 16, color: "white", fontWeight: "600" }}
          onPress={() => {
            Linking.openURL("https://forms.gle/Hq7ShywnPPrM9TMAA");
          }}>
          Collect Feedback
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ResourcesButton(props) {
  return <FullwidthButton style={{ height: 50, marginBottom: 20 }} {...props} />;
}

function ResourceDetails({ route, navigation }) {
  const { Id, Name } = route.params;
  const [resources, setResources] = React.useState([]);

  React.useEffect(() => {
    navigation.setOptions({ title: Name });

    (async () => {
      const query =
        `
        query MyQuery {
          ListResources(input: {CategoryId: ` +
        `${Id}` +
        `}) {
            Description
            MediaURL
            Category
            Id
            Title
          }
        }      
      `;

      const resources = await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
      if (resources.data.ListResources) {
        setResources(resources.data.ListResources);
      }
    })();
  }, []);

  return (
    <ScrollView style={{ paddingLeft: 10, paddingRight: 10 }}>
      <View style={{ marginTop: 20 }} />
      {resources.map((item, index) => (
        <ResourcesButton
          key={index}
          title={item.Title}
          onPress={() => navigation.navigate("Resource", { ...item, CategoryTypeName: Name })}
        />
      ))}
    </ScrollView>
  );
}

function ResourceView({ route, navigation }) {
  const resource = route.params;

  React.useEffect(() => {
    navigation.setOptions({ title: resource.Title });
  }, []);

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontWeight: "700", fontSize: 24 }}>{resource.Title}</Text>
      <Text>{resource.CategoryTypeName}</Text>
      <Text>{resource.Description}</Text>
      <Text>{resource.MediaURL}</Text>
    </ScrollView>
  );
}
