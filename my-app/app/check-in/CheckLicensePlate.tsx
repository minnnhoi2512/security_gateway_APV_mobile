import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  Button,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import {
  GestureHandlerRootView,
  TouchableOpacity,
} from "react-native-gesture-handler";
import * as FileSystem from "expo-file-system";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Overlay from "./OverLay";
import { CheckInVer02, CheckInVerWithLP } from "@/Types/checkIn.type";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useGetDataByCardVerificationQuery } from "@/redux/services/qrcode.service";
import { useGetVisitDetailByIdQuery } from "@/redux/services/visit.service";
import { uploadToFirebase } from "@/firebase-config";

interface ImageData {
  ImageType: "Shoe";
  ImageURL: string | null;
  ImageFile: string | null;
}

const CheckLicensePlate = () => {
  const { visitId } = useLocalSearchParams<{ visitId: string }>();
  const router = useRouter();
  const qrLock = useRef(false);

  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<ImageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );

  // Check camera permissions
  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setIsPermissionGranted(cameraStatus.status === "granted");
    })();
  }, []);

  const [checkInData, setCheckInData] = useState<CheckInVerWithLP>({
    CredentialCard: null,
    SecurityInId: 0,
    GateInId: Number(selectedGateId) || 0,
    QrCardVerification: "",
    Images: [],
    VehicleSession: {
      LicensePlate: "",
      vehicleImages: [],
    },
  });
  const {
    data: visitDetail,
    isLoading,
    isError,
  } = useGetVisitDetailByIdQuery(visitId);
  const fetchCaptureImage = async (): Promise<ImageData | null> => {
    try {
      const response = await fetch(
        "https://security-gateway-camera-1.tools.kozow.com/capture-image",
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        console.error("HTTP Response Status:", response.status);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const fileUri = `${FileSystem.cacheDirectory}captured-image.jpg`;

      const fileSaved = await new Promise<string | null>((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onloadend = async () => {
          const base64data = fileReader.result?.toString().split(",")[1];
          if (base64data) {
            await FileSystem.writeAsStringAsync(fileUri, base64data, {
              encoding: FileSystem.EncodingType.Base64,
            });
            resolve(fileUri);
          } else {
            reject(null);
          }
        };
        fileReader.readAsDataURL(blob);
      });
      console.log("file:", fileSaved);

      return {
        ImageType: "Shoe",
        ImageURL: null,
        ImageFile: fileSaved,
      };
    } catch (error) {
      console.error("Failed to fetch capture image:", error);
      Alert.alert("Error", "Failed to fetch the image. Please try again.");
      return null;
    }
  };

  const {
    data: qrCardData,
    isLoading: isLoadingQr,
    isError: isErrorQr,
  } = useGetDataByCardVerificationQuery(checkInData.QrCardVerification);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          // setUserId(storedUserId);
          setCheckInData((prevState) => ({
            ...prevState,
            SecurityInId: Number(storedUserId) || 0,
          }));
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
    if (visitDetail && Array.isArray(visitDetail) && visitDetail.length > 0) {
      const credentialCard = visitDetail[0]?.visitor?.credentialsCard;

      console.log("Original Credential Card:", credentialCard);

      setCheckInData((prevData) => ({
        ...prevData,
        CredentialCard: credentialCard,
      }));
    }
  }, [visitDetail]);

  useEffect(() => {
    const handleQrDataAndCapture = async () => {
      if (qrCardData) {
        console.log("QR Card Data received:", qrCardData);
       

        if (qrCardData.cardImage) {
          setQrImage(`data:image/png;base64,${qrCardData.cardImage}`);
        }

        if (qrCardData.cardVerification) {
          console.log(
            "Processing card verification:",
            qrCardData.cardVerification
          );

          try {
            const capturedImageData = await fetchCaptureImage();
            console.log("Captured image data:", capturedImageData);

            if (capturedImageData && capturedImageData.ImageFile) {
              setCapturedImage([capturedImageData]);
              const formattedImage = {
                ImageType: "Shoe",
                ImageURL: "",
                Image: capturedImageData.ImageFile,
              };

              // console.log("Formatted image data:", formattedImage);
              setCheckInData((prevData) => {
                const newData = {
                  ...prevData,
                  QrCardVerification: qrCardData.cardVerification,
                  Images: [formattedImage],
                };
                console.log("Updated checkInData:", newData);
                return newData;
              });
            } else {
              console.error("No image data captured");
            }
          } catch (error) {
            console.error("Error in capture process:", error);
            Alert.alert("Error", "Failed to capture and save image");
          }
        }
      }
    };

    handleQrDataAndCapture().catch((error) => {
      console.error("Error in handleQrDataAndCapture:", error);
    });
  }, [qrCardData]);

 

  useEffect(() => {
    if (qrCardData) {
      setIsProcessing(true);
      // setAutoCapture(true);
      if (qrCardData.cardImage) {
        setQrImage(`data:image/png;base64,${qrCardData.cardImage}`);
      }

      if (qrCardData.cardVerification) {
        setCheckInData((prevData) => ({
          ...prevData,
          QrCardVerification: qrCardData.cardVerification,
        }));
      }
    }
  }, [qrCardData]);

  const uploadImageToAPI = async (imageUri: string) => {
    try {
      setIsProcessing(true);

      // Tạo FormData object
      const formData = new FormData();

      // Thêm file ảnh vào FormData
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "photo.jpg",
      } as any);

      // Gọi API nhận dạng biển số
      const response = await fetch(
        "https://security-gateway-detect.tools.kozow.com/licensePlate",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Upload ảnh lên Firebase
      const fileName = `license_plate_${Date.now()}`;  
      const uploadResult = await uploadToFirebase(
        imageUri, 
        fileName,
        (progress: any) => {
          console.log('Upload progress:', progress);
        }
      );

      // Cập nhật state với URL từ Firebase
      // setCheckInData((prevData) => ({
      //   ...prevData,
      //   VehicleSession: {
      //     LicensePlate: result.licensePlate || "", 
      //     vehicleImages: [{
      //       ImageType: "LicensePlate_In",
      //       ImageURL: uploadResult.downloadUrl,
      //     }]
      //   }
      // }));

      // Hiển thị kết quả
      Alert.alert(
        "Kết quả nhận dạng",
        `Biển số xe: ${result.licensePlate || "Không nhận dạng được"}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert("Lỗi", "Không thể xử lý ảnh. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        quality: 0.8,
        allowsEditing: false,
        base64: false,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        // Upload ảnh và xử lý nhận dạng biển số
        await uploadImageToAPI(result.assets[0].uri);
        Alert.alert("Thành công", "Đã xử lý ảnh thành công!");
      }
    } catch (error) {
      console.error("Failed to take picture:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };
 

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      qrLock.current = true;
      setIsProcessing(true);

      try {
        console.log("Scanned QR Code Data:", data);

        setCheckInData((prevData) => ({
          ...prevData,
          QrCardVerification: data,
        }));

        setIsCameraActive(false);
      } catch (error) {
        console.error("Error handling QR Code:", error);
        Alert.alert("Error", "Failed to process QR code. Please try again.");
      } finally {
        setIsProcessing(false);
        qrLock.current = false;
      }
    }
  };

  useEffect(() => {
    const validateAndNavigate = async () => {
      if (
        !checkInData.QrCardVerification ||
        checkInData.Images.length !== 1 ||
        hasNavigated
      ) {
        return;
      }

      try {
        if (!hasNavigated) {
          setHasNavigated(true);
          router.push({
            pathname: "/check-in/CheckInOverall",
            params: {
              dataCheckIn: JSON.stringify(checkInData),
            },
          });
        }
      } catch (error: any) {
        console.log("ERR", error);

        const errorMessage =
          error.data?.message || "Please ensure all requirements are met.";
        Alert.alert("Đã xảy ra lỗi", errorMessage);
      }
    };

    validateAndNavigate();
  }, [checkInData, hasNavigated]);

  if (!isPermissionGranted) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-800 mb-4">Chưa cấp quyền camera</Text>
        <Button
          title="Yêu cầu quyền camera"
          onPress={async () => {
            const { status } =
              await ImagePicker.requestCameraPermissionsAsync();
            setIsPermissionGranted(status === "granted");
          }}
        />
      </View>
    );
  }

  if (isProcessing) {
    return (
      <View className="flex-1 items-center justify-center bg-backgroundApp">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Đang xử lý...</Text>
      </View>
    );
  }

  console.log("check in dâtta: ", checkInData);

  return (
    <SafeAreaView className="flex-1 bg-gray-100 mb-4">
      <View>
        <Pressable
          onPress={() => router.back()}
          className="flex flex-row items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg active:bg-gray-200"
        >
          <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
          <Text className="text-gray-600 font-medium">Quay về</Text>
        </Pressable>
      </View>

      <ScrollView>
        <GestureHandlerRootView className="flex-1 p-5">
          {/* Camera Capture Button */}
          <View className="mb-4">
            <TouchableOpacity
              className="flex-row items-center justify-center space-x-2 bg-blue-500 p-4 rounded-lg"
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={24} color="white" />
              <Text className="text-white font-medium">Chụp ảnh</Text>
            </TouchableOpacity>

            {capturedImage.length > 0 && (
              <View className="mt-4">
                <Text className="text-gray-700 mb-2">Ảnh đã chụp:</Text>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedImage(capturedImage[0].ImageFile || null)
                  }
                >
                  <Image
                    source={{ uri: capturedImage[0].ImageFile || "" }}
                    className="w-full h-40 rounded-lg"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* QR Scanner */}
          <View className=" aspect-[2/4] relative mb-4">
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={handleBarCodeScanned}
            />
            <Overlay />

            <View className="absolute top-14 left-4 bg-white px-3 py-2 rounded-md shadow-lg">
              <Text className="text-green-700 text-sm font-semibold">
                Quét QR Code
              </Text>
            </View>
          </View>

          {/* Modal for viewing images */}
          <Modal
            visible={!!selectedImage}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setSelectedImage(null)}
          >
            <View className="flex-1 bg-black/90 justify-center items-center">
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-96"
                  resizeMode="contain"
                />
              )}
              <TouchableOpacity
                className="mt-4 bg-white px-4 py-2 rounded-md"
                onPress={() => setSelectedImage(null)}
              >
                <Text className="text-red-500 font-bold">Đóng</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </GestureHandlerRootView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CheckLicensePlate;
