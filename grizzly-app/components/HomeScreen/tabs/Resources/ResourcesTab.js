import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useSelector } from "react-redux";
import { createStackNavigator } from "@react-navigation/stack";
import { ScrollView } from "react-native-gesture-handler";

import { ListResources } from "../../../../queries/queries";
import FullwidthButton from "../../../UtilityComponents/FullwidthButton";

const StackNavigator = createStackNavigator();

const styles = StyleSheet.create({
  sectionHeader: { fontWeight: "600", fontSize: 18, paddingTop: 20 },
  SOSButtons: { backgroundColor: "#8B0E04", padding: 15, borderRadius: 15, marginTop: 10 },
  GoalButtons: { backgroundColor: "#0054A4", padding: 15, borderRadius: 15, marginTop: 10 },
  ImproveButtons: { backgroundColor: "#794400", padding: 15, borderRadius: 15, marginTop: 10 },
  buttonText: { fontSize: 16, color: "white", fontWeight: "600" }
});

const stackNavScreenOpt = {
  headerStyle: {
    backgroundColor: "#8B0E04",
    shadowRadius: 0,
    shadowOffset: {
      height: 0
    }
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "bold"
  }
};

export default function ResourcesTab() {
  return (
    <StackNavigator.Navigator mode="modal">
      <StackNavigator.Screen name="Resources" component={ResourceComponent} options={stackNavScreenOpt} />
      <StackNavigator.Screen name="Type" component={ResourceDetails} options={stackNavScreenOpt} />
      <StackNavigator.Screen name="Resource" component={ResourceView} options={stackNavScreenOpt} />
    </StackNavigator.Navigator>
  );
}

function ResourceComponent({ navigation }) {
  const cadetInfo = useSelector((state) => state.cadetInfo);
  const resources = useSelector((state) => state.resourceCategories);

  return (
    <ScrollView style={{ paddingLeft: 10, paddingRight: 10 }}>
      <Text style={styles.sectionHeader}>SOS Resources</Text>
      {cadetInfo.Staff &&
        cadetInfo.Staff.map((staffInfo, index) => (
          <TouchableOpacity
            key={index}
            style={styles.SOSButtons}
            onPress={() => {
              Linking.openURL(`tel:+${staffInfo.Phone}`);
            }}>
            <Text style={styles.buttonText}>
              Call {staffInfo.StaffType} {staffInfo.FirstName} {staffInfo.LastName}
            </Text>
          </TouchableOpacity>
        ))}
      <TouchableOpacity
        style={styles.SOSButtons}
        onPress={() => {
          Linking.openURL(`tel:+${16265370187}`);
        }}>
        <Text style={styles.buttonText}>Call national crisis hotline</Text>
      </TouchableOpacity>
      <Text style={styles.sectionHeader}>Goal resources</Text>
      <View />
      {resources.map((item) => (
        <TouchableOpacity onPress={() => navigation.navigate("Type", item)} key={item.Id} style={styles.GoalButtons}>
          <Text style={styles.buttonText}>{item.Name.charAt(0).toUpperCase() + item.Name.slice(1)}</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.sectionHeader}>Make the app better</Text>
      <TouchableOpacity style={styles.ImproveButtons}>
        <Text
          style={styles.buttonText}
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
      const resources = await ListResources(Id);
      setResources(resources);
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
      {resource.MediaURL && (
        <TouchableOpacity
          style={{ marginTop: 10, padding: 10, backgroundColor: "#0054A4", borderRadius: "10" }}
          onPress={() => {
            Linking.openURL(resource.MediaURL);
          }}>
          <Text style={{ color: "white", fontWeight: "600" }}>Visit resource website</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
