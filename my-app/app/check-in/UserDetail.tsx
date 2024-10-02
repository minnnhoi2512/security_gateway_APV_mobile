import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  GestureHandlerRootView,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetVisitByCredentialCardQuery } from "@/redux/services/visit.service";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { uploadToFirebase } from "../../firebase-config";
import { CheckIn } from "@/Types/checkIn.type";
import { useShoeDetectMutation } from "@/redux/services/qrcode.service";
interface ScanData {
  id: string;
  nationalId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  issueDate: string;
}
interface ImageData {
  imageType: "shoe" | "body";
  imageURL: string;
}
const UserDetail = () => {
  const [shoeDetect, { isLoading: isDetecting, isError: isDetectError, data: detectData }] = useShoeDetectMutation();
  const { data } = useLocalSearchParams<{ data: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  console.log("DATA: ", data);
  const router = useRouter();
  let credentialCardId: string | null = null;
  const parseQRData = (qrData: string): ScanData => {
    const [id, nationalId, name, dateOfBirth, gender, address, issueDate] =
      qrData.split("|");
    credentialCardId = id;
    return { id, nationalId, name, dateOfBirth, gender, address, issueDate };
  };
  const [checkInData, setCheckInData] = useState<CheckIn>({
    visitDetailId: 0,
    securityInId: 0,
    gateInId: 0,
    qrCardVerification: "string",
    images: [],
  });
  const userData: ScanData | null = data ? parseQRData(data) : null;
  const [images, setImages] = useState<ImageData[]>([]);
  const {
    data: visitUser,
    isLoading,
    isError,
  } = credentialCardId
    ? useGetVisitByCredentialCardQuery(credentialCardId)
    : { data: null, isLoading: false, isError: true };
  useEffect(() => {
    if (permission?.granted) {
      setIsPermissionGranted(true);
    }
  }, [permission]);

  const takePhoto = async (imageType: "shoe" | "body") => {
    try {
      const cameraResp = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!cameraResp.canceled && cameraResp.assets[0]) {
        const { uri } = cameraResp.assets[0];
        const fileName = uri.split("/").pop() || 'image.jpg';

        // If it's a shoe photo, send it to the shoe detection API
        if (imageType === "shoe") {
          const file = {
            uri,
            type: 'image/jpeg',
            name: fileName,
          };

          // Call the shoe detection API
          const result = await shoeDetect(file);
          
          console.log("Shoe detection result:", result);
          // Handle the result as needed
        }

        // Save the image data (you might want to adjust this based on the API response)
        const newImage: ImageData = {
          imageType: imageType,
          imageURL: uri,
        };

        setImages((prevImages) => [...prevImages, newImage]);
        setCheckInData((prevData) => ({
          ...prevData,
          images: [...prevData.images, newImage],
        }));
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

  
  console.log("DATA: ", checkInData);
  if (!isPermissionGranted) {
    return (
      <View>
        <Text>Permission not granted</Text>
        <Button title="Request permission" onPress={requestPermission}></Button>
      </View>
    );
  }
  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  if (isError) {
    return <Text>Error fetching data</Text>;
  }
  if (!userData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-xl font-bold text-gray-800">
          Không có dữ liệu người dùng
        </Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView>
        <GestureHandlerRootView className="flex-1 p-5">
          <View className="bg-[#6255fa] rounded-3xl p-6 mb-6 shadow-lg">
            <Text className="text-3xl font-bold text-white text-center mb-4">
              {userData.name}
            </Text>
            <View className="flex-row justify-between mb-4">
              <View className="flex-row items-center">
                <Feather name="credit-card" size={18} color="white" />
                <Text className="text-white ml-2">CCCD: {userData.id}</Text>
              </View>
            </View>
            <View className="flex-row items-center mb-2">
              <Feather name="calendar" size={18} color="white" />
              <Text className="text-white ml-2">
                Ngày sinh: {userData.dateOfBirth}
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Feather name="user" size={18} color="white" />
              <Text className="text-white ml-2">
                Giới tính: {userData.gender}
              </Text>
            </View>
            <View className="flex-row items-center mb-4">
              <Feather name="map-pin" size={18} color="white" />
              <Text className="text-white ml-2 text-base">
                {userData.address}
              </Text>
            </View>
            <View className="flex-row items-center mb-4">
              <Feather name="calendar" size={18} color="white" />
              <Text className="text-white ml-2 text-base">
                Ngày cấp: {userData.issueDate}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (visitUser) {
                  router.push({
                    pathname: "/VisitDetail",
                    params: {
                      visitId: visitUser.visitId,
                      visitDetailId: visitUser.visitDetailId,
                    },
                  });
                }
              }}
              className="bg-white rounded-lg py-3 px-4 shadow-md"
            >
              <Text className="text-[#6255fa] text-lg font-semibold text-center">
                Xem chi tiết lịch hẹn
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-4">Chụp ảnh</Text>
          {/* Shoe photo section */}
          <View className="mb-4">
            <Text className="text-lg font-semibold mb-2">Ảnh giày</Text>
            {images.find((img) => img.imageType === "shoe") ? (
              <View>
                <Image
                  source={{
                    uri: images.find((img) => img.imageType === "shoe")!.imageURL,
                  }}
                  style={{ width: 200, height: 200, borderRadius: 10 }}
                />
                {isDetecting && <Text>Đang phân tích ảnh giày...</Text>}
                {isDetectError && <Text>Lỗi khi phân tích ảnh giày</Text>}
                {detectData && <Text>Kết quả phân tích: {JSON.stringify(detectData)}</Text>}
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => takePhoto("shoe")}
                className="bg-blue-500 p-3 rounded-lg"
              >
                <Text className="text-white text-center">Chụp ảnh giày</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity className="bg-[#6255fa] rounded-lg py-3 px-4 shadow-md">
            <Text className="text-white text-lg font-semibold text-center">
              Tiếp theo
            </Text>
          </TouchableOpacity>
        </GestureHandlerRootView>
      </ScrollView>
    </SafeAreaView>
  );
};
export default UserDetail;