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
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Overlay from "./OverLay";
import { CheckInVer02 } from "@/Types/checkIn.type";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useGetVisitDetailByIdQuery } from "@/redux/services/visit.service";
import { useGetDataByCardVerificationQuery } from "@/redux/services/qrcode.service";

interface ImageData {
  ImageType: "Shoe";
  ImageURL: string | null;
  ImageFile: string | null;
}

const UserDetail = () => {
  const { visitId } = useLocalSearchParams<{ visitId: string }>();
  const { data } = useLocalSearchParams<{ data: string }>();
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );

  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const qrLock = useRef(false);

  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [capturedImage, setCapturedImage] = useState<ImageData[]>([]);
  const [autoCapture, setAutoCapture] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // RTK QUERY

  const {
    data: visitDetail,
    isLoading,
    isError,
  } = useGetVisitDetailByIdQuery(visitId);

  //CHECKIN DATA
  const [checkInData, setCheckInData] = useState<CheckInVer02>({
    CredentialCard: null,
    SecurityInId: 0,
    GateInId: Number(selectedGateId) || 0,
    QrCardVerification: "",
    Images: [],
  });
  // https://security-gateway-camera.tools.kozow.com/camera-1/capture-image
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
          setUserId(storedUserId);
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
  const handleGoBack = () => {
    router.back();
  };

  useEffect(() => {
    const handleQrDataAndCapture = async () => {
      if (qrCardData) {
        console.log("QR Card Data received:", qrCardData);
        setAutoCapture(true);

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
      // setAutoCapture(true);
      setIsProcessing(true);
      if (qrCardData.cardVerification) {
        setCheckInData((prevData) => ({
          ...prevData,
          QrCardVerification: qrCardData.cardVerification,
        }));
      } else {
        setIsCameraActive(true);
      }
    } else {
      setIsCameraActive(true);
    }
  }, [data]);

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

  // const handleBarCodeScanned = async ({ data }: { data: string }) => {
  //   if (data && !qrLock.current) {
  //     qrLock.current = true;
  //     setIsScanning(true);
  //     console.log("Scanned QR Code Data:", data);

  //     setCheckInData((prevData) => ({
  //       ...prevData,
  //       QrCardVerification: data,
  //     }));

  //     setIsCameraActive(false);
  //     // setAutoCapture(true);
  //   }
  // };
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!data) {
      Alert.alert("Lỗi", "Không thể đọc được mã QR. Vui lòng thử lại.");
      return;
    }
  
    if (qrLock.current) {
      return;
    }
  
    try {
      qrLock.current = true;
      setIsProcessing(true);
      console.log("Scanned QR Code Data:", data);
  
      // Validate QR code format trước khi xử lý
 
  
      setCheckInData((prevData) => ({
        ...prevData,
        QrCardVerification: data,
      }));
  
      setIsCameraActive(false);
  
    } catch (error: any) {
      console.error("Error handling QR Code:", error);
      
      // Hiển thị thông báo lỗi cụ thể
      Alert.alert(
        "Lỗi quét mã",
        error.message || "Đã có lỗi xảy ra khi xử lý mã QR. Vui lòng thử lại.",
        [
          {
            text: "Thử lại",
            onPress: () => {
              qrLock.current = false;
              setIsProcessing(false);
              setIsCameraActive(true);
            }
          }
        ]
      );
    } finally {
      setIsProcessing(false);
      qrLock.current = false;
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

  // console.log("DATA CI: ", checkInData);
  // console.log("DATA DTV: ", visitDetail);

  //PERMISSION VIEW
  if (!isPermissionGranted) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-800 mb-4">Permission not granted</Text>
        <Button title="Request permission" onPress={requestPermission}></Button>
      </View>
    );
  }

  // if (isLoadingQr) {
  //   return (
  //     <View className="flex-1 justify-center items-center bg-gray-100">
  //       <Text className="text-xl font-semibold text-backgroundApp">
  //         Đang tải...
  //       </Text>
  //     </View>
  //   );
  // }

  // if (isProcessing || isLoadingQr) {
  //   return (
  //     <View style={styles.loadingCentered}>
  //       <ActivityIndicator size="large" color="red" />
  //       <Text style={styles.loadingText}>Hệ thống đang xử lý QR Code...</Text>
  //     </View>
  //   );
  // }

  if (isProcessing || isLoadingQr) {
    return (
      <View className="flex-1 items-center justify-center bg-backgroundApp">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Đang xử lý mã QR Code...</Text>
      </View>
    );
  }
  
  

  return (
    <SafeAreaView className="flex-1 bg-gray-100 mb-4">
      <View>
        <Pressable
          onPress={handleGoBack}
          className="flex flex-row items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg active:bg-gray-200"
        >
          <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
          <Text className="text-gray-600 font-medium">Quay về</Text>
        </Pressable>
      </View>

      <ScrollView>
        <GestureHandlerRootView className="flex-1 p-5">
          {/* MODAL VIEW IMAGE */}
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
                className="m-1 bg-white p-y-2 p-x-1 rounded-md"
                onPress={() => setSelectedImage(null)}
              >
                <Text className="text-red text-xl font-bold">✕</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <View className="w-full aspect-[2/4] relative mb-4">
            <CameraView
              className="flex-1 w-full h-full"
              onBarcodeScanned={handleBarCodeScanned}
            />
            <Overlay />

            <View className="absolute top-14 left-4 bg-white px-3 py-2 rounded-md shadow-lg">
              <Text className="text-green-700 text-sm font-semibold">
                Camera Checkin
              </Text>
            </View>

            <TouchableOpacity
              className="absolute top-14 right-4 bg-black bg-opacity-50 px-3 py-3 rounded"
              onPress={() => setIsCameraActive(false)}
            ></TouchableOpacity>
          </View>
        </GestureHandlerRootView>
      </ScrollView>

      {/* {isProcessing || isLoadingQr && (
        <View className="absolute inset-0  flex justify-center items-center z-[1000]">
          <ActivityIndicator size="large" color="red" />
          <Text className="text-red text-3xl mt-2">Đang xử lý...</Text>
        </View>
      )} */}
    </SafeAreaView>
  );
};
export default UserDetail;

const styles = StyleSheet.create({
  loadingCentered: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backgroundColor: "transparent",  
  },
  loadingText: {
    color: "red",
    fontSize: 20,
    marginTop: 10,
  },
});

