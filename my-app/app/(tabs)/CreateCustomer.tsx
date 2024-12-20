import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import Header from "@/components/UI/Header";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
const CreateCustomer = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (permission?.granted) {
      setIsPermissionGranted(true);
    }
  }, [permission]);

  const handleScanPress = async () => {
    if (permission?.granted) {
      router.push("/createVisit/ScanQrCreate");
    } else {
      const { granted } = await requestPermission();
      if (granted) {
        router.push("/createVisit/ScanQrCreate");
      } else {
 
        console.log("Camera permission denied");
      }
    }
  };
  return (
    <SafeAreaProvider className="flex-1 bg-backgroundApp">
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
              Tạo đăng ký ghé thăm
            </Text>
          </View>
         
        </View>
      </View>
    </SafeAreaProvider>
  );
};

export default CreateCustomer;
