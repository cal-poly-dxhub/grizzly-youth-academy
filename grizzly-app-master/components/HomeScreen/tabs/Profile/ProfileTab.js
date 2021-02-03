import React from "react";
import { Linking, ScrollView, View, Text, Image, Switch } from "react-native";
import { Auth, API } from "aws-amplify";
import { useSelector, useDispatch } from "react-redux";
import DefaultProfilePicture from "../../../../assets/defaultProfilePicture.jpg";
import { MaterialIcons } from "@expo/vector-icons";

import { createStackNavigator } from "@react-navigation/stack";
import FullwidthButton from "../../../UtilityComponents/FullwidthButton";
import { TouchableOpacity } from "react-native-gesture-handler";

const StackNavigator = createStackNavigator();
async function signOut() {
  try {
    await Auth.signOut();
  } catch (error) {
    console.log("error signing out: ", error);
  }
}

export default function ProfileTab() {
  return (
    <StackNavigator.Navigator>
      <StackNavigator.Screen name="Profile" component={ProfileComponent} />
    </StackNavigator.Navigator>
  );
}

function ProfileComponent() {
  const { Info, Ranking, Staff } = useSelector((state) => state.cadetInfo);
  const dispatch = useDispatch();
  const [rankingSwitch, setRankingSwitch] = React.useState(false);

  React.useEffect(() => {
    setRankingSwitch(Info.SharePoints);
  }, [Info]);

  if (!Info) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      <View style={{ flexDirection: "row", paddingBottom: 20 }}>
        <Image style={{ height: 120, width: 120, borderRadius: 10 }} source={DefaultProfilePicture} />
        <View style={{ paddingLeft: 10, justifyContent: "center" }}>
          <Text style={{ paddingBottom: 0, fontWeight: "600", fontSize: 20 }}>
            {`${Info.FirstName} ${Info.LastName}`}
          </Text>
          <Text style={{ fontWeight: "500", color: "#4a4a4a" }}>{`${Info.Platoon} - Class ${Info.Class}`}</Text>

          {/* <Text style={{ color: "#4a4a4a" }}>{Info.username}</Text>
          <Text style={{ paddingBottom: 10, color: "#4a4a4a" }}>
            {user && user.attributes && user.attributes.email}
          </Text> */}
        </View>
      </View>
      <Text style={{ fontWeight: "600", fontSize: 24, paddingTop: 20, paddingBottom: 10 }}>Rankings</Text>
      <View style={{ flexDirection: "row", paddingBottom: 20 }}>
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 55, color: "#0054A4" }}>{Info.Points}</Text>
          <Text style={{ textAlign: "center", fontWeight: "600", color: "#8B0E04" }}>{"Total\nPoints"}</Text>
        </View>
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 55, color: "#0054A4" }}>{Ranking.ClassRank}</Text>
          <Text style={{ textAlign: "center", fontWeight: "600", color: "#8B0E04" }}>{"Individual\nRanking"}</Text>
        </View>
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 55, color: "#0054A4" }}>{Ranking.PlatoonRank}</Text>
          <Text style={{ textAlign: "center", fontWeight: "600", color: "#8B0E04" }}>{"Platoon\nRanking"}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ flex: 1, fontSize: 16 }}>Share ranking with other cadets</Text>
        <Switch
          value={rankingSwitch}
          onValueChange={async () => {
            setRankingSwitch(!rankingSwitch);
            const updateCadet = `
            mutation MyMutation {
              UpdateCadet(input: {SharePoints: ${!rankingSwitch}}) {
                Id
                SharePoints
              }
            }
            `;
            const res = await API.graphql({ query: updateCadet, authMode: "AMAZON_COGNITO_USER_POOLS" });
            dispatch({
              type: "SET_CADET_INFO",
              payload: {
                Ranking: Ranking,
                Staff: Staff,
                Info: {
                  ...Info,
                  SharePoints: res.data.UpdateCadet.SharePoints
                }
              }
            });
          }}
        />
      </View>
      <View>
        <Text style={{ fontWeight: "600", fontSize: 24, paddingTop: 20, paddingBottom: 10 }}>Staff Information</Text>
        {Staff.map((staffInfo) => (
          <View style={{ flexDirection: "row", alignItems: "center" }} key={staffInfo.Id}>
            <View style={{ flex: 1 }}>
              <Text style={{ paddingBottom: 0, fontWeight: "600", fontSize: 20 }}>
                {`${staffInfo.FirstName} ${staffInfo.LastName}`}
              </Text>
              <Text style={{ fontWeight: "500", paddingBottom: 5 }}>{staffInfo.StaffType}</Text>
              <Text style={{ fontWeight: "500", color: "#696969" }}>{staffInfo.Email}</Text>
              <Text style={{ fontWeight: "500", color: "#696969" }}>{staffInfo.Phone}</Text>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: "#a7cfb2", padding: 10, borderRadius: "8" }}
              onPress={() => {
                Linking.openURL(`mailto:${staffInfo.Email}`);
              }}>
              <MaterialIcons name="email" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: "#a7c6cf", padding: 10, borderRadius: "8", marginLeft: 10 }}
              onPress={() => {
                Linking.openURL(`tel:+${staffInfo.Phone}`);
              }}>
              <MaterialIcons name="phone" size={24} color="black" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={{ padding: 20 }}>
        <FullwidthButton title="LOG OUT" onPress={signOut} />
      </View>
    </ScrollView>
  );
}
