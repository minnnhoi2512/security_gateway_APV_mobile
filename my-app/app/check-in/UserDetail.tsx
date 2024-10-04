import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  Button,
  Alert,
  StyleSheet,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  GestureHandlerRootView,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import { uploadToFirebase } from "../../firebase-config";
import { CheckIn } from "@/Types/checkIn.type";
import { useGetVisitByCredentialCardQuery } from "@/redux/services/visit.service";
import { useShoeDetectMutation } from "@/redux/services/qrcode.service";
import { useCheckInMutation } from "@/redux/services/checkin.service";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";


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
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  let credentialCardId: string | null = null;
  const [userId, setUserId] = useState<string | null>(null);
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );
  const [isCameraActive, setIsCameraActive] = useState(false);
  const qrLock = useRef(false);
  const parseQRData = (qrData: string): ScanData => {
    const [id, nationalId, name, dateOfBirth, gender, address, issueDate] =
      qrData.split("|");
    credentialCardId = id;
    return { id, nationalId, name, dateOfBirth, gender, address, issueDate };
  };

  const userData: ScanData | null = data ? parseQRData(data) : null;
  const [images, setImages] = useState<ImageData[]>([]);

  const [
    shoeDetect,
    { isLoading: isDetecting, isError: isDetectError, data: detectData },
  ] = useShoeDetectMutation();
  const {
    data: visitUser,
    isLoading,
    isError,
  } = credentialCardId
    ? useGetVisitByCredentialCardQuery(credentialCardId)
    : { data: null, isLoading: false, isError: true };

  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();

  const [checkInData, setCheckInData] = useState<CheckIn>({
    visitDetailId: visitUser ? visitUser.visitDetailId : 0,
    securityInId: 0,
    gateInId: Number(selectedGateId) || 0,
    qrCardVerification: "",
    images: [],
  });

  useEffect(() => {
    if (visitUser && visitUser.length > 0) {
      const firstVisitUser = visitUser[0];
      setCheckInData((prevData) => ({
        ...prevData,
        visitDetailId: firstVisitUser.visitDetailId,
      }));
    }
  }, [visitUser]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          console.log("User ID from AsyncStorage:", storedUserId);
        } else {
          console.log("No userId found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      setCheckInData((prevState) => ({
        ...prevState,
        securityInId: Number(userId) || 0,
      }));
    }
  }, [userId, selectedGateId]);

  console.log("User Id: ", userId);

  useEffect(() => {
    if (permission?.granted) {
      setIsPermissionGranted(true);
    }
  }, [permission]);

  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setIsPermissionGranted(status === "granted");
    };

    checkPermissions();
  }, []);

  const takePhoto = async (imageType: "shoe" | "body") => {
    try {
      const cameraResp = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
  
      if (!cameraResp.canceled && cameraResp.assets[0]) {
        const { uri } = cameraResp.assets[0];
        const fileName = uri.split("/").pop() || `${imageType}_${Date.now()}.jpg`;
  
        const newImage: ImageData = { imageType, imageURL: uri };
        setImages((prevImages) => [
          ...prevImages.filter((img) => img.imageType !== imageType),
          newImage,
        ]);
  
        if (imageType === "shoe") {
          const file = {
            uri,
            type: "image/jpeg",
            name: fileName,
          };
  
          // Detailed logging of the file object
          console.log('File object details:');
          console.log('- URI:', file.uri);
          console.log('- Type:', file.type);
          console.log('- Name:', file.name);
  
          try {
            console.log('Sending file to shoeDetect:', JSON.stringify(file, null, 2));
            const result = await shoeDetect(file).unwrap();
            console.log("Shoe detection result:", JSON.stringify(result, null, 2));
            Alert.alert("Success", "Shoe detection completed successfully.");
          } catch (error: any) {
            console.error("Shoe detection API call failed:", JSON.stringify(error, null, 2));
            if (error.error === 'PARSING_ERROR') {
              Alert.alert("Server Error", `The server responded with an error: ${error.message}`);
            } else if (error.data) {
              console.error("Server response data:", JSON.stringify(error.data, null, 2));
              Alert.alert("Error", `Server error: ${JSON.stringify(error.data)}`);
            } else {
              Alert.alert("Error", "An unknown error occurred. Please try again.");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error taking photo:", JSON.stringify(error, null, 2));
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };


  const uploadPhotosAndCheckIn = async () => {
    if (images.length < 2) {
      Alert.alert(
        "Error",
        "Please take both shoe and body photos before checking in."
      );
      return;
    }

    try {
      const uploadPromises = images.map(async (image) => {
        const { downloadUrl } = await uploadToFirebase(
          image.imageURL,
          `${image.imageType}_${Date.now()}.jpg`,
          (progress: number) => {
            console.log(`Upload of ${image.imageType} is ${progress}% done`);
          }
        );
      

        return { imageType: image.imageType, imageURL: downloadUrl };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const updatedCheckInData = {
        ...checkInData,
        images: uploadedImages,
      };

      console.log("Updated CheckIn Data: ", updatedCheckInData);

      const result = await checkIn(updatedCheckInData).unwrap();
      console.log("Check-in successful:", result);
      Alert.alert("Success", "Check-in completed successfully!");
    } catch (error: any
    ) {
      console.error("Upload or check-in failed:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      Alert.alert("Error", "Upload or check-in failed. Please try again.");
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      qrLock.current = true;
      console.log("Scanned QR Code Data:", data);
      setCheckInData((prevData) => ({
        ...prevData,
        qrCardVerification: data,
      }));
      setIsCameraActive(false);
      Alert.alert(
        "QR Code Scanned",
        "QR Code has been successfully scanned and added to the check-in data."
      );
    }
  };
  // console.log("DATA: ", checkInData);

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
    <SafeAreaView className="flex-1 bg-gray-100 mb-4">
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
                    uri: images.find((img) => img.imageType === "shoe")!
                      .imageURL,
                  }}
                  style={{ width: 200, height: 200, borderRadius: 10 }}
                />
                {isDetecting && <Text>Đang phân tích ảnh giày...</Text>}
                {isDetectError && <Text>Lỗi khi phân tích ảnh giày</Text>}
                {detectData && (
                  <Text>Kết quả phân tích: {JSON.stringify(detectData)}</Text>
                )}
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
          <View className="mb-4">
            <Text className="text-lg font-semibold mb-2">Ảnh toàn thân</Text>
            {images.find((img) => img.imageType === "body") ? (
              <Image
                source={{
                  uri: images.find((img) => img.imageType === "body")!.imageURL,
                }}
                style={{ width: 200, height: 200, borderRadius: 10 }}
              />
            ) : (
              <TouchableOpacity
                onPress={() => takePhoto("body")}
                className="bg-green-500 p-3 rounded-lg"
              >
                <Text className="text-white text-center">
                  Chụp ảnh toàn thân
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.container}>
            {isCameraActive ? (
              <View style={styles.cameraContainer}>
                <CameraView
                  style={styles.cameraView}
                  onBarcodeScanned={handleBarCodeScanned}
                />
                <View style={styles.scanningFrame} />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsCameraActive(false)}
                >
                  <Text style={styles.closeButtonText}>Close Camera</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => setIsCameraActive(true)}
              >
                <Text style={styles.buttonText}>Scan QR Code</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            className="bg-[#6255fa] rounded-lg py-3 px-4 shadow-md"
            onPress={uploadPhotosAndCheckIn}
            disabled={isCheckingIn || images.length < 2}
          >
            <Text className="text-white text-lg font-semibold text-center">
              {isCheckingIn ? "Đang xử lý..." : "Upload ảnh và Check-in"}
            </Text>
          </TouchableOpacity>
        </GestureHandlerRootView>
      </ScrollView>
    </SafeAreaView>
  );
};
export default UserDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  cameraContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    marginVertical: 20,
  },
  cameraView: {
    flex: 1,
  },
  scanningFrame: {
    position: "absolute",
    top: "30%",
    left: "30%",
    width: "40%",
    height: "30%",
    borderWidth: 2,
    borderColor: "yellow",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },

  scanButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    marginBottom: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
  },
});




