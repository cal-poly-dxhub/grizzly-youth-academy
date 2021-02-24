import React from "react";
import { View, Text, Platform, TouchableOpacity, TextInput, Dimensions } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import moment from "moment";

export default function CalendarEdit(props) {
  const {
    pickerMode,
    dateValue,
    setDateValue,
    repeatedDays,
    setRepeatedDays,
    repeatOptions,
    setRepeatOptions,
    setDoneChange
  } = props.route.params;

  const [dateText, setDateText] = React.useState(moment(dateValue));
  const [localRepeatedDate, setLocalRepeatedDate] = React.useState(repeatedDays);
  const [localRepeatOptions, setLocalRepeatOptions] = React.useState(repeatOptions);

  React.useEffect(() => {
    if (Platform.OS === "web") {
      setDateText(dateValue.format("MM/DD/YYYY h:mm a"));
    } else {
      setDateText(dateValue);
    }
  }, []);

  React.useEffect(() => {
    const dateIndex = moment(dateText).isoWeekday() - 1;
    setLocalRepeatedDate(localRepeatedDate.map((m, i) => (i === dateIndex ? true : m)));
  }, [dateText]);

  return (
    <View
      style={{
        marginTop: Dimensions.get("window").height * 0.1,
        marginLeft: 25,
        marginRight: 25,
        padding: 20,
        borderRadius: 10,
        backgroundColor: "rgb(242,242,242)",
        borderColor: "#6e6e6e",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
          weight: 0,
          height: 5
        },
        shadowRadius: 4,
        elevation: 3,
        shadowOpacity: 0.7
      }}>
      <Text style={{ fontSize: 18, fontWeight: "500" }}>Choose a {pickerMode}</Text>
      {Platform.OS === "web" ? (
        <View>
          <TextInput
            style={{ height: 50, fontSize: 18 }}
            value={dateText}
            placeholder={`Enter a ${pickerMode}`}
            onChangeText={(txt) => setDateText(txt)}
          />
          <Text>Date and time formatted as MM/DD/YYYY h:mm am/pm</Text>
        </View>
      ) : (
        <DateTimePicker
          style={{ height: 200 }}
          value={new Date(dateText.format())}
          mode={pickerMode}
          is24Hour={true}
          display="spinner"
          minuteInterval={5}
          onChange={(e, date) => {
            const oldDate = moment(dateText);
            setLocalRepeatedDate(localRepeatedDate.map((m, index) => (oldDate.isoWeekday() - 1 === index ? false : m)));
            setDateText(moment(date));
          }}
        />
      )}
      <View style={{ paddingBottom: 15, alignItems: "center", zIndex: 100 }}>
        <View style={{ flexDirection: "row", alignItems: "center", height: 40 }}>
          <DropDownPicker
            items={["Repeat", "Don't repeat"].map((item) => {
              return { value: item, label: `${item}` };
            })}
            style={{ backgroundColor: "#fafafa", width: localRepeatOptions.repeat === "Repeat" ? 95 : 135 }}
            defaultValue={localRepeatOptions.repeat}
            dropDownStyle={{ backgroundColor: "#fafafa" }}
            onChangeItem={(item) => {
              setLocalRepeatOptions({
                ...localRepeatOptions,
                repeat: item.value
              });
            }}
          />
          {localRepeatOptions.repeat === "Repeat" && <Text> every </Text>}
          {/* {localRepeatOptions.repeat === "Repeat" && (
            <DropDownPicker
              items={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => {
                return { value: item, label: `${item}` };
              })}
              style={{ backgroundColor: "#fafafa", width: 60 }}
              defaultValue={localRepeatOptions.occurance}
              dropDownStyle={{ backgroundColor: "#fafafa" }}
              onChangeItem={(item) => {
                setLocalRepeatOptions({
                  ...localRepeatOptions,
                  occurance: item.value
                });
              }}
            />
          )} */}
          {localRepeatOptions.repeat === "Repeat" && (
            <DropDownPicker
              items={["Week", "Month"].map((item) => {
                return { value: item, label: item };
              })}
              style={{ backgroundColor: "#fafafa", width: 85 }}
              defaultValue={localRepeatOptions.type}
              dropDownStyle={{ backgroundColor: "#fafafa" }}
              onChangeItem={(item) => {
                setLocalRepeatOptions({
                  ...localRepeatOptions,
                  type: item.value
                });
              }}
            />
          )}
        </View>
      </View>
      {localRepeatOptions.type === "Week" && localRepeatOptions.repeat === "Repeat" && (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: localRepeatedDate[index] ? "#0054A4" : "#a8a8a8",
                padding: 10,
                borderRadius: 50
              }}
              onPress={() => {
                if (moment(dateText).isoWeekday() - 1 !== index)
                  setLocalRepeatedDate(localRepeatedDate.map((d, i) => (i === index ? !d : d)));
              }}>
              <View style={{ width: 16, height: 16, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>{day}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#0054A4",
            margin: 20,
            marginBottom: 0,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 20,
            paddingRight: 20,
            width: 120,
            alignItems: "center",
            borderRadius: 20
          }}
          onPress={async () => {
            await setDateValue(moment(dateText));
            await setRepeatedDays(localRepeatedDate);
            await setRepeatOptions(localRepeatOptions);
            if (setDoneChange) await setDoneChange();
            props.navigation.goBack();
          }}>
          <Text style={{ color: "white", fontWeight: "600", fontSize: 17 }}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}