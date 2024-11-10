import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/UI/Header";
import { useRouter } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VideoPlayer from "../check-in/streaming";

interface ImageData {
  ImageType: "Shoe";
  ImageURL: string | null;
  ImageFile: string | null;
}

const Checkin = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );
  const [autoCapture, setAutoCapture] = useState(false);
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);
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
  const handleImageCapture = async (imageData: ImageData) => {
    try {
      // setCapturedImage([imageData]);
      // const formattedImageData = {
      //   ImageType: imageData.ImageType,
      //   ImageURL: "",
      //   Image: imageData.ImageFile || "",
      // };
      // setCheckInData((prev) => ({
      //   ...prev,
      //   Images: [formattedImageData],
      // }));
      // const downloadUrl = await uploadToFirebase(
      //   imageData.imageFile,
      //   `${imageData.imageType}_${Date.now()}.jpg`
      // );
      // console.log("Image uploaded successfully:", downloadUrl);
      // Update state or pass the URL as needed
    } catch (error) {
      Alert.alert("Upload Error", "Failed to upload image to Firebase");
    }
  };

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

  const toggleVideoPlayer = () => {
    setIsVideoPlayerVisible((prev) => !prev);
  };

  return (
    <SafeAreaView className="flex-1 bg-backgroundApp">
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <Header name="Đặng Dương" />

        <View className="flex-1 justify-center items-center px-4">
          <TouchableOpacity
            onPress={handleScanPress}
            className="bg-[#34495e] rounded-2xl p-6 items-center justify-center w-[200px] h-54 shadow-lg"
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
          <TouchableOpacity
            onPress={toggleVideoPlayer}
            className="bg-[#34495e] rounded-2xl p-4 mt-4"
          >
            <Text className="text-white font-bold">Hiển thị Video</Text>
          </TouchableOpacity>

          {/* Conditionally render VideoPlayer */}
          {isVideoPlayerVisible && (
            <View className="h-[200px] w-[300px]">
              <VideoPlayer
                onCaptureImage={handleImageCapture}
                autoCapture={autoCapture}
              />
                   <TouchableOpacity
            onPress={toggleVideoPlayer}
            className="bg-[#34495e]  p-4"
          >
            <Text className="text-white font-bold">Ẩn</Text>
          </TouchableOpacity>
            </View>
            
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Checkin;
