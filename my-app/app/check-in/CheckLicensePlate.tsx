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
import {
  CheckInVer02,
  CheckInVerWithLP,
  ValidCheckIn,
} from "@/Types/checkIn.type";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useGetDataByCardVerificationQuery } from "@/redux/services/qrcode.service";
import { useGetVisitDetailByIdQuery } from "@/redux/services/visit.service";
import { useGetCameraByGateIdQuery } from "@/redux/services/gate.service";

interface ImageData {
  ImageType: "Shoe";
  ImageURL: string | null;
  ImageFile: string | null;
}

interface CapturedImage {
  ImageType: string;
  Image: string;
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
  const [hasScannedQR, setHasScannedQR] = useState(false);
  const [hasPhotoTaken, setHasPhotoTaken] = useState(false);
  const [isScanDisabled, setIsScanDisabled] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);
  const [validLicensePlateNumber, setValidLicensePlateNumber] =
    useState<boolean>(false);
  const [isCameraLaunched, setIsCameraLaunched] = useState(false);
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );
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

  const [validCheckInData, setValidCheckInData] = useState<ValidCheckIn>({
    CredentialCard: null,
    QRCardVerification: "",
    ImageShoe: [],
  });

  // API queries
  const {
    data: visitDetail,
    isLoading,
    isError,
  } = useGetVisitDetailByIdQuery(visitId);

  const {
    data: qrCardData,
    isError: isErrorQr,
    refetch,
  } = useGetDataByCardVerificationQuery(checkInData.QrCardVerification, {
    skip: checkInData.QrCardVerification == "",
  });

  // Check camera permissions
  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setIsPermissionGranted(cameraStatus.status === "granted");
    })();
  }, []);

  useEffect(() => {
    if (isPermissionGranted && !isCameraLaunched) {
      setIsCameraLaunched(true);
      takePhoto();
    }
  }, [isPermissionGranted, isCameraLaunched]);

  // Fetch user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setCheckInData((prevState) => ({
            ...prevState,
            SecurityInId: Number(storedUserId) || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  // Handle visit detail data
  useEffect(() => {
    if (visitDetail && Array.isArray(visitDetail) && visitDetail.length > 0) {
      const credentialCard = visitDetail[0]?.visitor?.credentialsCard;
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
  const handleQrDataAndCapture = async () => {
    if (!Array.isArray(cameraGate)) {
      console.log("Missing required data:", {
        isArray: Array.isArray(cameraGate),
      });
      return;
    }

    try {
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
        // console.log("Attempting to capture body image from:", bodyImageUrl);

        const bodyImageData = await fetchCaptureImage(
          bodyImageUrl,
          "CheckIn_Body"
        );

        if (bodyImageData.ImageFile) {
          images.push({
            ImageType: "CheckIn_Body",

            Image: bodyImageData.ImageFile,
          });
          // console.log("Body image captured successfully");
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
          QrCardVerification: qrCardData?.cardVerification || "",
          Images: images,
        }));

        // Cập nhật validCheckInData
        const shoeImage = images.find(
          (img) => img.ImageType === "CheckIn_Shoe"
        );
        if (shoeImage?.Image) {
          setValidCheckInData((prevData) => ({
            ...prevData,
            QRCardVerification: qrCardData?.cardVerification || "",
            ImageShoe: shoeImage.Image,
          }));
          console.log("ValidCheckInData updated with shoe image");
        }
        return images;
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
  const directData = async () => {
    if (qrCardData) {
      setIsProcessing(true);
      if (qrCardData.cardImage) {
        setQrImage(`data:image/png;base64,${qrCardData.cardImage}`);
      }
      if (qrCardData?.cardVerification) {
        setHasScannedQR(true);
      }
      setIsProcessing(false);
    }
  };
  useEffect(() => {
    directData();
  }, [qrCardData]);

  // console.log("check in data: ", checkInData);

  const uploadImageToAPI = async (imageUri: string) => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "photo.jpg",
      } as any);

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
        return Alert.alert(
          "Lỗi",
          "Hệ thống không thể xử lý ảnh. Vui lòng thử lại"
        );
      }

      const result = await response.json();
      console.log(result);
      setIsCameraActive(false);
      setCheckInData((prevData) => ({
        ...prevData,
        VehicleSession: {
          LicensePlate: result.licensePlate || "",
          vehicleImages: [
            {
              ImageType: "LicensePlate_In",
              ImageURL: "",
              Image: imageUri,
            },
          ],
        },
      }));

      setHasPhotoTaken(true);
      setValidLicensePlateNumber(true);
      Alert.alert(
        "Kết quả nhận dạng",
        `Biển số xe: ${result.licensePlate || "Không nhận dạng được"}`,
        [
          {
            text: "OK",
            onPress: () => console.log("keke"),
          },
        ]
      );
    } catch (error) {
      // console.error("Error processing image:", error);
      setValidLicensePlateNumber(false);
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
        await uploadImageToAPI(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Failed to take picture:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };

  const validateAndNavigate = async (checkInData: CheckInVerWithLP) => {
    console.log(checkInData);
    const isDataComplete =
      checkInData.CredentialCard !== null &&
      checkInData.SecurityInId !== 0 &&
      checkInData.GateInId !== 0 &&
      checkInData.QrCardVerification !== "" &&
      checkInData.Images.length > 0 &&
      checkInData.VehicleSession.LicensePlate !== "" &&
      checkInData.VehicleSession.vehicleImages.length > 0;
    if (!isDataComplete) {
      return;
    }

    try {
      const dataToSend = {
        ...checkInData,
        __type: "CheckInVerWithLP",
      };

      router.push({
        pathname: "/check-in/ValidCheckInScreen",
        params: {
          dataCheckIn: JSON.stringify(dataToSend),
          dataValid: JSON.stringify({
            CredentialCard: checkInData.CredentialCard,
            QRCardVerification: checkInData.QrCardVerification,
            ImageShoe:
              checkInData.Images.find((img) => img.ImageType === "CheckIn_Shoe")
                ?.Image || null,
          }),
        },
      });
    } catch (error: any) {
      console.log("ERR", error);
      const errorMessage =
        error.data?.message || "Vui lòng đảm bảo đã có đầy đủ thông tin";
      Alert.alert("Đã xảy ra lỗi", errorMessage);
    }
  };

  // useEffect(() => {
  //   if (isErrorQr && !hasShownError) {
  //     setHasShownError(true);
  //     Alert.alert("Lỗi", "Không tìm thấy dữ liệu QR. Vui lòng thử lại.", [
  //       {
  //         text: "OK",
  //         onPress: () => {
  //           qrLock.current = false;
  //           setIsProcessing(false);
  //           setCheckInData((prev) => ({ ...prev, QrCardVerification: "" }));
  //           // router.back();
  //         },
  //       },
  //     ]);
  //   }
  // }, [isErrorQr]);

  // const handleBarCodeScanned = async ({ data }: { data: string }) => {
  //   if (data && !qrLock.current) {
  //     qrLock.current = true;
  //     setIsProcessing(true);
  //     try {
  //       setCheckInData((prevData) => ({
  //         ...prevData,
  //         QrCardVerification: data,
  //       }));
  //       console.log("Scanned QR Code Data:", data);
  //       setIsCameraActive(false);
  //       setHasScannedQR(true);
  //       const captureImage: CapturedImage[] | undefined =
  //         await handleQrDataAndCapture();
  //       await validateAndNavigate({
  //         ...checkInData,
  //         Images: captureImage || [],
  //         QrCardVerification: data,
  //       });
  //     } catch (error) {
  //       console.error("Error handling QR Code:", error);
  //       Alert.alert("Error", "Failed to process QR code. Please try again.");
  //     } finally {
  //       setIsProcessing(false);
  //       qrLock.current = false;
  //     }
  //   }
  // };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      if (!data.includes("-") && !hasScannedQR) {
        setCheckInData((prevData) => ({
          ...prevData,
          QrCardVerification: data,
        }));
        // Alert.alert("Lỗi", "QR Code không hợp lệ. Vui lòng thử lại.");
      } else {
        qrLock.current = true;
        setIsProcessing(true);
        try {
          setCheckInData((prevData) => ({
            ...prevData,
            QrCardVerification: data,
          }));
          console.log("Scanned QR Code Data:", data);
          setIsCameraActive(false);
          setHasScannedQR(true);
          const captureImage: CapturedImage[] | undefined =
            await handleQrDataAndCapture();
          await validateAndNavigate({
            ...checkInData,
            Images: captureImage || [],
            QrCardVerification: data,
          });
        } catch (error) {
          console.error("Error handling QR Code:", error);
          Alert.alert("Error", "Failed to process QR code. Please try again.");
        } finally {
          setIsProcessing(false);
          qrLock.current = false;
        }
      }
    }
  };

  // const handleBarCodeScanned = ({ data }: { data: string }) => {
  //   if (data && !qrLock.current) {
  //     qrLock.current = true;
  //     setCheckInData((prevData) => ({
  //       ...prevData,
  //       QrCardVerification: data,
  //     }));
  //     setIsProcessing(true);
  //     console.log("Scanned QR Code Data:", data);
  //   }
  // };

  // const handleBarCodeScanned = async ({ data }: { data: string }) => {
  //   if (data && !qrLock.current) {
  //     qrLock.current = true;
  //     setIsProcessing(true);

  //     try {
  //       setCheckInData((prevData) => ({
  //         ...prevData,
  //         QrCardVerification: data,
  //       }));
  //       setIsCameraActive(false);
  //       setHasScannedQR(true);
  //     } catch (error) {
  //       console.error("Error handling QR Code:", error);
  //       Alert.alert("Error", "Failed to process QR code. Please try again.");
  //     } finally {
  //       setIsProcessing(false);
  //       qrLock.current = false;
  //     }
  //   }
  // };
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
  if (hasScannedQR) {
    return (
      <View className="flex-1 items-center justify-center bg-backgroundApp">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Đang xử lý...</Text>
      </View>
    );
  }
  // console.log("check in data thuong: ", checkInData);

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
              <Text className="text-white font-medium">
                Chụp lại ảnh nhận dạng xe
              </Text>
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
          {
            <View className="aspect-[2/4] relative mb-4">
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
          }

          {/* Status Indicators */}
          <View className="mt-4 p-4 bg-white rounded-lg">
            <Text className="text-lg font-semibold mb-2">Trạng thái:</Text>
            <View className="flex-row items-center space-x-2">
              <View
                className={`w-3 h-3 rounded-full ${
                  hasPhotoTaken ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <Text className="text-gray-700">
                Chụp ảnh: {hasPhotoTaken ? "Đã hoàn thành" : "Chưa hoàn thành"}
              </Text>
            </View>
            <View className="flex-row items-center space-x-2 mt-2">
              <View
                className={`w-3 h-3 rounded-full ${
                  hasScannedQR ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <Text className="text-gray-700">
                Quét QR: {hasScannedQR ? "Đã hoàn thành" : "Chưa hoàn thành"}
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
