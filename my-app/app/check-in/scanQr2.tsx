import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  StyleSheet,
} from "react-native";
import { CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useCallback } from "react";

const ScanQr2 = () => {
  const router = useRouter();
  const [isCameraActive, setIsCameraActive] = useState(false);

  useFocusEffect(
    useCallback(() => {
      
      setIsCameraActive(true);

      return () => {
   
        setIsCameraActive(false);
      };
    }, [])
  );

  const handleGoToScanQr1 = () => {
    router.replace("/check-in/scanQr");  
  };

  const handleGoBack = () => {
    router.back(); 
  };

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      {isCameraActive && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          // Logic scan QR cho màn hình này
        />
      )}
      <View className="absolute top-14 left-4 bg-white px-3 py-2 rounded-md shadow-lg">
        <Text className="text-green-700 text-sm font-semibold">Camera Checkin 2222</Text>
      </View>
      <TouchableOpacity
        className="absolute top-14 right-4 bg-black bg-opacity-50 px-3 py-3 rounded"
        onPress={handleGoBack}
      >
        <Text className="text-white">Thoát Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.switchButton} onPress={handleGoToScanQr1}>
        <Text style={styles.switchButtonText}>Switch to Camera 1</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ScanQr2;

const styles = StyleSheet.create({
  switchButton: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -75 }],
    backgroundColor: "#0072C6",
    padding: 15,
    borderRadius: 8,
  },
  switchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
