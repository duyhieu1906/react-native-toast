import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Animated, View, Text } from "react-native";
import { ToastService } from "./ToastService";

const ToastItem = (props) => {
  const { style, textStyle, duration } = props.data;
  const { message, removeItem, item } = props;
  const animateOpacityValue = useRef(new Animated.Value(0));
  const refItem = useRef();

  useEffect(() => {
    Animated.timing(animateOpacityValue.current, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      const timerID = setTimeout(() => {
        Animated.timing(animateOpacityValue.current, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          clearTimeout(timerID);
          removeItem();
        });
      }, item?.duration || duration || 1500);
    });
  }, []);
  return (
    <Animated.View
      ref={refItem}
      style={[
        {
          marginHorizontal: 20,
          marginBottom: 10,
          paddingHorizontal: 18,
          paddingVertical: 9,
          borderRadius: 12,
          opacity: animateOpacityValue.current,
          backgroundColor: "rgba(1,1,1,0.7)",
        },
        style,
        item?.style
      ]}
    >
      <Text
        style={[
          {
            fontSize: 18,
            alignSelf: "stretch",
            textAlign: "center",
            color: "white",
          },
          textStyle,
        ]}
      >
        {message}
      </Text>
    </Animated.View>
  );
};

const Toast = forwardRef((props, ref) => {
  const { wrapperStyle, numberDisplay } = props;
  const list = useRef([]);
  const position = useRef("bottom");
  const [, setShow] = useState(false);
  const refToast = useRef();

  useImperativeHandle(ref, () => ({
    showToast,
  }));

  useEffect(() => {
    ToastService.addEventListener("Toast", showToast);
    return () => {
      ToastService.removeEventListener("Toast");
    };
  }, []);

  const showToast = (data) => {
    if (list.current.length >= numberDisplay) {
      list.current.shift();
    }
    list.current = [
      ...list.current,
      { message: data.message, timeSet: new Date().getTime(),...data },
    ];
    position.current = data.position;
    setShow((prev) => !prev);
  };

  const removeItem = () => {
    list.current.shift();
    setShow((prev) => !prev);
  };

  if (list.current.length > 0) {
    return (
      <View
        ref={refToast}
        style={[
          {
            position: "absolute",
            bottom: position.current === "bottom" ? "5%" : "90%",
            zIndex: 9999,
            alignSelf: "center",
          },
          wrapperStyle,
        ]}
      >
        {list.current.map((item, index) => {
          return (
            <ToastItem
              key={"" + item.message + item.timeSet}
              message={item.message}
              item={item}
              data={props}
              removeItem={removeItem}
            />
          );
        })}
      </View>
    );
  } else {
    return null;
  }
});

export { Toast };
