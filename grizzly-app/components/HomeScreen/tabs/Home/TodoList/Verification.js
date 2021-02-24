import React, { useState, useEffect } from "react";
import { Button, Image, View, Platform, Text, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Storage, API, Auth } from "aws-amplify";
import { useDispatch } from "react-redux";
import { AntDesign } from "@expo/vector-icons";
import {
  updateReduxStateTasks,
  getCadetInfo,
  getRankedCadets,
  getCompletedActions
} from "../../../../../queries/queries";

export default function ImagePickerExample({ navigation, route }) {
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    setLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1
    });

    if (!result.cancelled) {
      setImage(result.uri);
      setImageName(result.uri.split("/").splice(-1)[0]);
    }
    setLoading(false);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgb(242,242,242)",
        marginTop: 200,
        padding: 20,
        borderColor: "rgba(0,0,0,0.3)",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderWidth: 1
      }}>
      <View style={{ paddingBottom: 5, flexDirection: "row" }}>
        <Text style={{ fontWeight: "700", fontSize: 20, flex: 1 }}>Verification</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <AntDesign name="close" size={20} color="black" />
        </TouchableOpacity>
      </View>
      <Text>
        Provide a picture that proves that you finished the task. If verification is not provided, points will not be
        awarded.
      </Text>
      <View
        style={{
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
          paddingBottom: 15
        }}>
        <View style={{ margin: 10 }}>
          <Button title="Pick an image from camera roll" onPress={pickImage} />
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="black" />
        ) : (
          image && <Image source={{ uri: image }} style={{ flex: 1, borderRadius: 15 }} />
        )}
      </View>
      <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
        <TouchableOpacity
          style={{ marginRight: 10, padding: 10, backgroundColor: "#b0b0b0", borderRadius: 8 }}
          onPress={async () => {
            setLoading(true);
            const mutation = `
            mutation MyMutation {
              CompleteAssignedAction(input: {
                  AssignmentDateTime: "${route.params.AssignedDate}", 
                  Evidence: "",
                  TemplateId: ${route.params.templateId}}) {
                Action {
                  Id
                }
              }
            }
            `;

            await API.graphql({ query: mutation, authMode: "AMAZON_COGNITO_USER_POOLS" });
            const { month, year } = route.params.selectedMonthYear;
            await updateReduxStateTasks(dispatch, month, year);
            const r = await getCadetInfo();
            const ranks = await getRankedCadets();
            dispatch({ type: "SET_CADET_INFO", payload: r });
            dispatch({ type: "SET_RANKING", payload: ranks.sort((a, b) => (a.Points > b.Points ? -1 : 1)) });
            getCompletedActions(dispatch);
            setLoading(false);
            navigation.navigate("Calendar");
          }}>
          <Text style={{ fontWeight: "500" }}>Skip verification</Text>
        </TouchableOpacity>
        {image && (
          <TouchableOpacity
            style={{ padding: 10, backgroundColor: "#0054A4", borderRadius: 8 }}
            onPress={async () => {
              setLoading(true);
              const response = await fetch(image);
              const blob = await response.blob();
              const fileName = `${Date.now()}_${imageName}`;

              Storage.put(fileName, blob, {
                level: "private",
                contentType: "image/jpg"
              });

              let curUser = await Auth.currentUserCredentials();
              let cogUserId = curUser.identityId;

              const mutation = `
              mutation MyMutation {
                CompleteAssignedAction(input: {
                    AssignmentDateTime: "${route.params.AssignedDate}", 
                    Evidence: "private/${cogUserId}/${fileName}",
                    TemplateId: ${route.params.templateId}}) {
                  Action {
                    Id
                  }
                }
              }
              `;

              await API.graphql({ query: mutation, authMode: "AMAZON_COGNITO_USER_POOLS" });
              const { month, year } = route.params.selectedMonthYear;
              await updateReduxStateTasks(dispatch, month, year);
              const r = await getCadetInfo();
              const ranks = await getRankedCadets();
              dispatch({ type: "SET_CADET_INFO", payload: r });
              dispatch({ type: "SET_RANKING", payload: ranks.sort((a, b) => (a.Points > b.Points ? -1 : 1)) });
              getCompletedActions(dispatch);
              setLoading(false);
              navigation.navigate("Calendar");
            }}>
            <Text style={{ color: "white", fontWeight: "500" }}>Submit picture</Text>
          </TouchableOpacity>
        )}
        {!image && (
          <View style={{ padding: 10, backgroundColor: "#77a1c9", borderRadius: 8 }}>
            <Text style={{ color: "white", fontWeight: "500" }}>Submit picture</Text>
          </View>
        )}
      </View>
    </View>
  );
}
