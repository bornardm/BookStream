import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Button,
  TextInput,
} from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";

export default function ScannerScreen({ route, navigation }) {
  const [camContainerSize, setCamContainerSize] = useState({
    width: 0,
    height: 0,
  });
  const [clearSquare, setClearSquare] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });
  const [boundingBox, setBoundingBox] = useState({
    height: 0,
    width: 0,
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (camContainerSize.width !== 0) {
      const squareSize =
        Math.min(camContainerSize.width, camContainerSize.height) * 0.8;
      const squareTop = (camContainerSize.height - squareSize) / 2;
      const squareLeft = (camContainerSize.width - squareSize) / 2;
      setClearSquare({
        width: squareSize,
        height: squareSize,
        top: squareTop,
        left: squareLeft,
      });
    }
  }, [camContainerSize]);

  //   useEffect(() => {
  //     console.log(clearSquare);
  //   }, [clearSquare]);

  const onScan = (scanningResult) => {
    //console.log(scanningResult.boundingBox);
    //console.log("isbn :", scanningResult.data);
    const boundingBox = {
      height: scanningResult.boundingBox.size.width,
      width: scanningResult.boundingBox.size.height,
      top: scanningResult.boundingBox.origin.x,
      left: scanningResult.boundingBox.origin.y,
    };
    setBoundingBox(boundingBox);
  };
  return (
    <View
      style={styles.camContainer}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setCamContainerSize({ width, height });
      }}
    >
      <CameraView
        style={styles.camera}
        facing={"back"}
        barcodeScannerSettings={{ barcodeTypes: ["ean13"] }}
        onBarcodeScanned={(scanningResult) => {
          onScan(scanningResult);
        }}
      >
        <View
          style={[styles.opacityTop, { height: clearSquare.top }]}
          //onLayout={console.log("layout", clearSquare)}
        ></View>
        <View
          style={[styles.opacityBottom, { height: clearSquare.top }]}
        ></View>
        <View
          style={[
            styles.opacityLeft,
            {
              height: clearSquare.height,
              width: clearSquare.left,
              top: clearSquare.top,
            },
          ]}
        ></View>
        <View
          style={[
            styles.opacityRight,
            {
              height: clearSquare.height,
              width: clearSquare.left,
              top: clearSquare.top,
            },
          ]}
        ></View>
        <View
          style={[
            styles.centerLine,
            {
              width: clearSquare.width,
              top: clearSquare.top + clearSquare.height / 2,
              left: clearSquare.left,
            },
          ]}
        />
        <View
          style={{
            position: "absolute",
            height: boundingBox.height,
            width: boundingBox.width,
            top: boundingBox.top,
            left: boundingBox.left,
            borderColor: "blue",
            borderWidth: 3,
          }}
          //onLayout={console.log("boundingBox", boundingBox)}
        ></View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  camContainer: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  opacityTop: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    position: "absolute",
    top: 0,
    left: 0,
  },
  opacityRight: {
    backgroundColor: "rgba(0,0,0,0.5)",
    position: "absolute",
    right: 0,
  },
  opacityLeft: {
    backgroundColor: "rgba(0,0,0,0.5)",
    position: "absolute",
    left: 0,
  },
  opacityBottom: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  centerLine: {
    position: "absolute",
    height: 1,
    backgroundColor: "red",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
