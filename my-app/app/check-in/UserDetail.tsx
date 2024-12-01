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
import { CheckInVer02, ValidCheckIn } from "@/Types/checkIn.type";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useGetVisitDetailByIdQuery } from "@/redux/services/visit.service";
import { useGetDataByCardVerificationQuery } from "@/redux/services/qrcode.service";
import { useGetCameraByGateIdQuery } from "@/redux/services/gate.service";

interface ImageData {
  ImageType: "Shoe";
  ImageURL: string | null;
  ImageFile: string | null;
}

interface CapturedImage {
  ImageType: string;
  ImageURL: string;
  Image: string;
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

  const [validCheckInData, setValidCheckInData] = useState<ValidCheckIn>({
    CredentialCard: null,
    QRCardVerification: "",
    ImageShoe: [],
  });

  

  const gateId = Number(selectedGateId) || 0;
  const {
    data: cameraGate,
    isLoading: isLoadingGate,
    isError: isErrorCamera,
  } = useGetCameraByGateIdQuery(
    { gateId },
    {
      skip: !gateId,
    }
  );

 
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
      setValidCheckInData((prevData) => ({
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

  const fetchCaptureImage = async (
    url: string,
    imageType: string
  ): Promise<{ ImageType: string; ImageFile: string | null }> => {
    try {
      const response = await fetch(url, { method: "GET" });

      if (!response.ok) {
        console.error("HTTP Response Status:", response.status);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const fileUri = `${FileSystem.cacheDirectory}captured-image-${imageType}.jpg`;

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

      return {
        ImageType: imageType,
        ImageFile: fileSaved,
      };
    } catch (error) {
      console.error(`Failed to fetch ${imageType} image:`, error);
      Alert.alert(
        "Error",
        `Failed to fetch ${imageType} image. Please try again.`
      );
      return { ImageType: imageType, ImageFile: null };
    }
  };

  useEffect(() => {
    console.log("Camera Gate Structure:", JSON.stringify(cameraGate, null, 2));

    const handleQrDataAndCapture = async () => {
      if (!qrCardData.cardVerification || !cameraGate || !Array.isArray(cameraGate)) {
        console.log("Missing required data:", {
          cardVerification: qrCardData.cardVerification,
          cameraGate: !!cameraGate,
          isArray: Array.isArray(cameraGate),
        });
        return;
      }

      try {
        console.log("Processing card verification:", qrCardData.cardVerification);

        // Tìm camera trực tiếp từ mảng cameraGate
        const bodyCamera = cameraGate.find(
          (camera) => camera?.cameraType?.cameraTypeName === "CheckIn_Body"
        );

        const shoeCamera = cameraGate.find(
          (camera) => camera?.cameraType?.cameraTypeName === "CheckIn_Shoe"
        );

        console.log("Found cameras:", {
          bodyCamera: bodyCamera?.cameraURL,
          shoeCamera: shoeCamera?.cameraURL,
        });

        const images: CapturedImage[] = [];

        // Chụp ảnh body
        if (bodyCamera?.cameraURL) {
          const bodyImageUrl = `${bodyCamera.cameraURL}capture-image`;
          console.log("Attempting to capture body image from:", bodyImageUrl);

          const bodyImageData = await fetchCaptureImage(
            bodyImageUrl,
            "CheckIn_Body"
          );

          if (bodyImageData.ImageFile) {
            images.push({
              ImageType: "CheckIn_Body",
              ImageURL: "",
              Image: bodyImageData.ImageFile,
            });
            console.log("Body image captured successfully");
          }
        }

        // Chụp ảnh giày
        if (shoeCamera?.cameraURL) {
          const shoeImageUrl = `${shoeCamera.cameraURL}capture-image`;
          console.log("Attempting to capture shoe image from:", shoeImageUrl);

          const shoeImageData = await fetchCaptureImage(
            shoeImageUrl,
            "CheckIn_Shoe"
          );

          if (shoeImageData.ImageFile) {
            images.push({
              ImageType: "CheckIn_Shoe",
              ImageURL: "",
              Image: shoeImageData.ImageFile,
            });
            console.log("Shoe image captured successfully");
          }
        }

        if (images.length > 0) {
          console.log("Setting state with captured images:", images.length);

          // Cập nhật checkInData
          setCheckInData((prevData) => ({
            ...prevData,
            QrCardVerification: qrCardData.cardVerification,
            Images: images,
          }));

          // Cập nhật validCheckInData
          const shoeImage = images.find(
            (img) => img.ImageType === "CheckIn_Shoe"
          );
          if (shoeImage?.Image) {
            setValidCheckInData((prevData) => ({
              ...prevData,
              QRCardVerification: qrCardData.cardVerification,
              ImageBody: shoeImage.Image,
            }));
            console.log("ValidCheckInData updated with shoe image");
          }
        } else {
          console.error("No images were captured successfully");
          Alert.alert("Warning", "Không thể chụp ảnh. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Error in capture process:", error);
        Alert.alert(
          "Error",
          "Lỗi khi chụp ảnh. Vui lòng kiểm tra cấu hình camera và thử lại."
        );
      }
    };

    handleQrDataAndCapture().catch((error) => {
      // console.error("Error in handleQrDataAndCapture:", error);
    });
  }, [qrCardData, cameraGate]);
  

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
            },
          },
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
        checkInData.Images.length === 0 ||
        hasNavigated
      ) {
        return;
      }

      try {
        if (!hasNavigated) {
          setHasNavigated(true);
          router.push({
            pathname: "/check-in/ValidCheckInScreen",
            params: {
              dataCheckIn: JSON.stringify(checkInData),
              dataValid: JSON.stringify({
                CredentialCard: checkInData.CredentialCard,
                QRCardVerification: checkInData.QrCardVerification,
                ImageShoe:
                  checkInData.Images.find(
                    (img) => img.ImageType === "CheckIn_Shoe"
                  )?.Image || null,
              }),
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
