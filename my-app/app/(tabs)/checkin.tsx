import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/UI/Header";
import { useRouter } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Checkin = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.log("No userId found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  const handleScanPress = async () => {
    if (permission?.granted) {
      router.push("/check-in/scanQr");
    } else {
      const { granted } = await requestPermission();
      if (granted) {
        router.push("/check-in/scanQr");
      } else {
        // Handle permission denied
        console.log("Camera permission denied");
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-backgroundApp">
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <Header name="Đặng Dương" />

        <View className="flex-1 justify-center items-center px-4">
          <TouchableOpacity
            onPress={handleScanPress}
            className="bg-[#34495e] rounded-2xl p-6 items-center justify-center w-64 h-64 shadow-lg"
          >
            <Ionicons name="qr-code-outline" size={100} color="white" />
            <Text className="text-white font-bold text-lg mt-4">
              Quét mã QR
            </Text>
          </TouchableOpacity>
          <View className="p-4 ">
            <Text className="text-2xl font-bold text-[#34495e]">
              Tiến hành check in
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Checkin;
