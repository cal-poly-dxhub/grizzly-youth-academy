import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button, Linking } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { API } from "aws-amplify";
import moment from "moment";
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";

const StackNavigator = createStackNavigator();

const styles = StyleSheet.create({
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
    borderRadius: 15
  },
  iconStyle: {
    marginRight: 15
  },
  title: {
    fontWeight: "800",
    fontSize: 16
  },
  body: { fontSize: 12, marginTop: 5 }
});

export default function NotificationTab() {
  const dispatch = useDispatch();

  const updateNotification = async () => {
    const query = `
      query MyQuery {
        PreviewNotifications {
          Description
          Id
          Title
          Viewed
        }
      } 
    `;

    const notif = await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
    if (notif.data.PreviewNotifications) {
      const notifPayload = notif.data.PreviewNotifications.sort((a, b) => (a.Viewed > b.Viewed ? 1 : -1));
      dispatch({ type: "SET_NOTIFICATION", payload: notifPayload });
    }
  };

  React.useEffect(() => {
    updateNotification();
  }, []);

  return (
    <StackNavigator.Navigator mode="modal">
      <StackNavigator.Screen name="Notifications" component={NotificationList} />
      <StackNavigator.Screen name="Details" component={NotificationDetails} />
    </StackNavigator.Navigator>
  );
}

function NotificationDetails({ navigation, route }) {
  const item = route.params;
  const dispatch = useDispatch();
  const [notifDetails, setNotifDetails] = React.useState({});

  const updateNotification = async () => {
    const query = `
      query MyQuery {
        PreviewNotifications {
          Description
          Id
          Title
          Viewed
        }
      } 
    `;

    const notif = await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
    if (notif.data.PreviewNotifications) {
      const notifPayload = notif.data.PreviewNotifications.sort((a, b) => (a.Viewed > b.Viewed ? 1 : -1));
      dispatch({ type: "SET_NOTIFICATION", payload: notifPayload });
    }
  };

  React.useEffect(() => {
    (async () => {
      const query = `
      query MyQuery {
        GetNotification(Id: ${item.Id}) {
          CreationDate
          Description
          Id
          MediaURL
          Title
          Viewed
        }
      }`;

      const notifDetail = await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
      setNotifDetails(notifDetail.data.GetNotification);
      updateNotification();
    })();
  }, [item]);

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontWeight: "700", fontSize: 20 }}>{notifDetails.Title}</Text>
      <Text>{moment(notifDetails.CreationDate).format("MM/DD/YYYY")}</Text>
      <Text style={{ marginTop: 10 }}>{notifDetails.Description}</Text>
      {notifDetails.MediaURL && (
        <TouchableOpacity
          style={{ marginTop: 10, padding: 10, backgroundColor: "#0054A4", borderRadius: "10" }}
          onPress={() => {
            Linking.openURL(notifDetails.MediaURL);
          }}>
          <Text style={{ color: "white", fontWeight: "600" }}>Go to {notifDetails.MediaURL}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function NotificationList({ navigation }) {
  const reduxNotifs = useSelector((state) => state.notifications);
  const RenderItemList = ({ item }) => <NotificationItem item={item} navigation={navigation} />;

  return (
    <FlatList
      style={{ paddingTop: 15 }}
      data={reduxNotifs}
      renderItem={RenderItemList}
      keyExtractor={(item) => `${item.Id}`}
    />
  );
}

function NotificationItem(props) {
  const { item, navigation } = props;

  return (
    <TouchableOpacity
      style={[
        styles.notifitemContainer,
        !item.Viewed ? { backgroundColor: "rgba(0, 84, 164, 1)" } : { backgroundColor: "rgba(0, 84, 164, 0.7)" }
      ]}
      onPress={() => {
        navigation.navigate("Details", item);
      }}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: "white" }]}>{item.Title}</Text>
        <Text style={[styles.body, { color: "white" }]}>{item.Description}</Text>
      </View>
    </TouchableOpacity>
  );
}
