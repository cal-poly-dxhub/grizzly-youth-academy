import React from "react";
import { View, TouchableWithoutFeedback, Keyboard, Dimensions } from "react-native";
import { useSelector } from "react-redux";

export default function StickyKeyboardView(props) {
  const [bottomCoord, setBottomCoord] = React.useState(0);
  const insets = useSelector((state) => state.insets);

  React.useEffect(() => {
    props.focusTextInput.current.focus();

    const keyboardWillShowStub = Keyboard.addListener("keyboardWillShow", (e) => {
      setBottomCoord(e.endCoordinates.height);
    });

    const keyboardWillHideStub = Keyboard.addListener("keyboardWillHide", () => {
      setBottomCoord(0);
    });

    return () => {
      keyboardWillShowStub.remove();
      keyboardWillHideStub.remove();
    };
  }, []);

  return (
    <TouchableWithoutFeedback>
      <View style={{ flex: 1 }}>
        <View
          style={
            bottomCoord === 0
              ? {
                  top: Dimensions.get("window").height * 0.35
                }
              : {
                  bottom: (insets.bottom ? bottomCoord - insets.bottom : bottomCoord) + 20,
                  position: "absolute"
                }
          }>
          {props.children}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
