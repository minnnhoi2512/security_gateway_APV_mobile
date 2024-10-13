import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
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
import * as RNPicker from "@react-native-picker/picker";

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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const qrLock = useRef(false);

  const [userId, setUserId] = useState<string | null>(null);
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );

  let credentialCardId: string | null = null;
  const parseQRData = (qrData: string): ScanData => {
    const [id, nationalId, name, dateOfBirth, gender, address, issueDate] =
      qrData.split("|");
    credentialCardId = id;
    return { id, nationalId, name, dateOfBirth, gender, address, issueDate };
  };
  const userData: ScanData | null = data ? parseQRData(data) : null;

  const [images, setImages] = useState<ImageData[]>([]);

  // RTK QUERY
  const [
    shoeDetect,
    { isLoading: isDetecting, isError: isDetectError, data: detectData },
  ] = useShoeDetectMutation();
  // const credentialCardId = userData?.id || null;
  const {
    data: visitUser,
    isLoading: isVisitLoading,
    isError: isVisitError,
    error: visitError,
  } = useGetVisitByCredentialCardQuery(credentialCardId!, {
    skip: !credentialCardId,
  });
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
// console.log("Visit User: ", visitUser);

  // RTK QUERY
  const [shoeDetectResult, setShoeDetectResult] = useState<boolean | null>(
    null
  );
  const [securityConfirmation, setSecurityConfirmation] = useState<string>("");
  //CHECKIN DATA
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
  //CHECKIN DATA

  // console.log("User Id: ", visitUser);

  //PERMISSION
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
  //PERMISSION

  const takePhoto = async (imageType: "shoe" | "body") => {
    try {
      const cameraResp = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!cameraResp.canceled && cameraResp.assets[0]) {
        const { uri } = cameraResp.assets[0];
        const fileName =
          uri.split("/").pop() || `${imageType}_${Date.now()}.jpg`;

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

          // LOG VALUE FILE PUSH TO API
          console.log("File object details:");
          console.log("- URI:", file.uri);
          console.log("- Type:", file.type);
          console.log("- Name:", file.name);

          try {
            console.log(
              "Sending file to shoeDetect:",
              JSON.stringify(file, null, 2)
            );
            const result = await shoeDetect(file).unwrap();
            console.log(
              "Shoe detection result:",
              JSON.stringify(result, null, 2)
            );
            setShoeDetectResult(true);
            Alert.alert("Success", "Shoe detection completed successfully.");
          } catch (error: any) {
            console.error(
              "Shoe detection API call failed:",
              JSON.stringify(error, null, 2)
            );
            if (error.error === "PARSING_ERROR") {
              Alert.alert(
                "Server Error",
                `The server responded with an error: ${error.message}`
              );
            } else if (error.data) {
              console.error(
                "Server response data:",
                JSON.stringify(error.data, null, 2)
              );
              Alert.alert(
                "Error",
                `Server error: ${JSON.stringify(error.data)}`
              );
            } else {
              Alert.alert(
                "Error",
                "An unknown error occurred. Please try again."
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error taking photo:", JSON.stringify(error, null, 2));
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const isCheckInEnabled = () => {
    return (
      images.length === 2 &&
      shoeDetectResult === true &&
      checkInData.qrCardVerification !== "" &&
      securityConfirmation === "correct"
    );
  };
  // console.log("SE CONFIRM: ", securityConfirmation);

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
      Alert.alert("Success", "Check-in completed successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.push("/(tabs)/");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Upload or check-in failed:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      Alert.alert("Error", "Upload or check-in failed. Please try again.");
    }
  };

  //SCAN QR CERTIFICATION
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
  //SCAN QR CERTIFICATION

  //PERMISSION VIEW
  if (!isPermissionGranted) {
    return (
      <View>
        <Text>Permission not granted</Text>
        <Button title="Request permission" onPress={requestPermission}></Button>
      </View>
    );
  }

  if (isVisitLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6255fa" />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  if (isVisitError) {
    return (
      <View style={styles.centerContainer}>
        <Text>Error fetching visit data: {JSON.stringify(visitError)}</Text>
        <Button
          title="Retry"
          onPress={() => router.replace("/check-in/UserDetail")}
        />
      </View>
    );
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

  // console.log("check data: ", checkInData);

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
                      // visitId: visitUser.visitId,
                      id: visitUser.visitId,
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
          {/* Security guard confirmation */}
          <View>
            <Text>Xác nhận bảo vệ</Text>
            <RNPicker.Picker
              selectedValue={securityConfirmation}
              onValueChange={(itemValue) => setSecurityConfirmation(itemValue)}
            >
              <RNPicker.Picker.Item label="Lựa chọn" value="" />
              <RNPicker.Picker.Item label="Đúng" value="correct" />
              <RNPicker.Picker.Item label="Sai" value="incorrect" />
            </RNPicker.Picker>
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
                  <Text style={styles.closeButtonText}>Thoát Camera</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => setIsCameraActive(true)}
              >
                <Text style={styles.buttonText}>Quét QR Code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* <TouchableOpacity
            className={`bg-[#6255fa] rounded-lg py-3 px-4 shadow-md ${
              !isCheckInEnabled() ? "opacity-50" : ""
            }`}
            onPress={uploadPhotosAndCheckIn}
            disabled={isCheckingIn || images.length < 2}
          >
            <Text className="text-white text-lg font-semibold text-center">
              {isCheckingIn ? "Đang xử lý..." : "Check-in"}
            </Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            disabled={!isCheckInEnabled()}
            style={[
              styles.checkInButton,
              { backgroundColor: isCheckInEnabled() ? "#6255fa" : "#ccc" },
            ]}
            onPress={uploadPhotosAndCheckIn}
          >
            <Text style={styles.buttonText}>Check In</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  userInfoCard: {
    backgroundColor: "#6255fa",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  photoSection: {
    marginBottom: 20,
  },
  photoSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  capturedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  captureButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
  },
  captureButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  qrScannerContainer: {
    marginBottom: 20,
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
  },
  scanButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },

  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginTop: 10,
  },
  checkInButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  disabledButton: {
    opacity: 0.5,
  },
  checkInButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "red",
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  
});
