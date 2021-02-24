import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Linking,
  ActivityIndicator
} from "react-native";
import moment from "moment";
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { ListNotifications, MarkAsViewed } from "../../../../queries/queries";

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

export default function NotificationTab() {
  return (
    <StackNavigator.Navigator mode="modal">
      <StackNavigator.Screen name="Notifications" component={NotificationList} options={stackNavScreenOpt} />
      <StackNavigator.Screen name="Details" component={NotificationDetails} options={stackNavScreenOpt} />
    </StackNavigator.Navigator>
  );
}

function NotificationDetails({ navigation, route }) {
  const item = route.params;
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      await MarkAsViewed(item.Id);
      setLoading(false);
    })();
  }, [item]);

  return (
    <ScrollView style={{ padding: 20 }}>
      {loading ? (
        <View style={{ flex: 1 }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <View>
          <Text style={{ fontWeight: "700", fontSize: 20 }}>{item.Title}</Text>
          <Text>{moment(item.CreationDateTime).format("MM/DD/YYYY h:mm:ss a")}</Text>
          <Text style={{ marginTop: 10 }}>{item.Description}</Text>
          {item.MediaURL && (
            <TouchableOpacity
              style={{ marginTop: 10, padding: 10, backgroundColor: "#0054A4", borderRadius: "10" }}
              onPress={() => {
                Linking.openURL(item.MediaURL);
              }}>
              <Text style={{ color: "white", fontWeight: "600" }}>Visit attached link</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function NotificationList({ navigation }) {
  const reduxNotifs = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = React.useState(false);
  const RenderItemList = ({ item }) => <NotificationItem item={item} navigation={navigation} />;

  const updateNotification = async () => {
    const listNotifs = await ListNotifications();
    if (listNotifs) {
      const notifPayload = listNotifs.sort((a, b) => (a.Viewed > b.Viewed ? 1 : -1));
      dispatch({ type: "SET_NOTIFICATION", payload: notifPayload });
    }
  };

  return (
    <FlatList
      style={{ paddingTop: 15 }}
      data={reduxNotifs}
      renderItem={RenderItemList}
      keyExtractor={(item) => `${item.Id}`}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await updateNotification();
            setRefreshing(false);
          }}
        />
      }
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
