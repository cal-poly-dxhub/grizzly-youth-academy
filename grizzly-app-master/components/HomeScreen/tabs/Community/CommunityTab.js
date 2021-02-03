import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { getEvents, getRankedCadets } from "../../../../queries/queries";
import { createStackNavigator } from "@react-navigation/stack";
import moment from "moment";

const StackNavigator = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

export default function CommunityTab() {
  return (
    <StackNavigator.Navigator>
      <StackNavigator.Screen name="Community" component={CommunityComponent} />
    </StackNavigator.Navigator>
  );
}

function CommunityComponent() {
  const [ranking, setRanking] = React.useState([]);

  const updateRanking = React.useCallback(async () => {
    const ranks = await getRankedCadets();
    setRanking(ranks.sort((a, b) => (a.Points > b.Points ? -1 : 1)));
  }, []);

  React.useEffect(() => {
    updateRanking();
  }, []);

  const RankingWrapper = () => <RankingComponent ranking={ranking} />;

  return (
    <Tab.Navigator title="Header">
      <Tab.Screen name="RANKING" component={RankingWrapper} />
      <Tab.Screen name="EVENT" component={NotificationList} />
    </Tab.Navigator>
  );
}

const dummydata = [
  {
    id: "0",
    title: "PLATOON MEETUP THURSDAY",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
  }
];

function NotificationList({ navigation }) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const info = await getEvents();
      setEvents(info);
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={{ paddingTop: 15 }}
        data={events}
        renderItem={({ item }) => (
          <NotificationItem
            title={item.Title}
            description={item.Description}
            creationDate={item.CreationDate}
            navigation={() => setModalVisible(!modalVisible)}
          />
        )}
        keyExtractor={(item, index) => `${index}`}
      />
    </View>
  );
}

let styles = StyleSheet.create({
  notifitemContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 5,
    marginLeft: 10,
    marginBottom: 5,
    marginRight: 10,
    paddingLeft: 15,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#8B0E04",
    borderRadius: 15
  },
  iconStyle: {
    marginRight: 15
  },
  title: {
    fontWeight: "800",
    color: "white"
  },
  body: { fontSize: 12, marginTop: 5, color: "white" },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

function NotificationItem({ title, description, creationDate, navigation }) {
  return (
    <TouchableOpacity style={styles.notifitemContainer} onPress={navigation}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={{ fontSize: 12, color: "white" }}>{moment(creationDate).format("YYYY-MM-DD h:mm a")}</Text>
        <Text style={styles.body}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

function RankingComponent(props) {
  const { ranking } = props;
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={{ paddingTop: 5 }}
        data={ranking}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}`}
      />
    </View>
  );
}

function renderItem({ item, index }) {
  return (
    <View style={styles.notifitemContainer}>
      <Text style={{ paddingRight: 20, fontSize: 18, fontWeight: "500", color: "white" }}>{index + 1}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "700", fontSize: 18, marginBottom: 5, color: "white" }}>
          {item.FirstName + " " + item.LastName}
        </Text>
        <Text style={{ color: "white" }}>{item.Platoon + " - " + item.Class}</Text>
      </View>
      <Text style={{ paddingRight: 20, fontSize: 18, fontWeight: "500", color: "white" }}>{item.Points}</Text>
    </View>
  );
}
