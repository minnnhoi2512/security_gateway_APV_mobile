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
  Platform,
  BackHandler,
} from "react-native";
import {
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import * as FileSystem from "expo-file-system";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CheckInVerWithLP,
  ValidCheckIn,
} from "@/Types/checkIn.type";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
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

interface CameraType {
  cameraTypeId: number;
  cameraTypeName: string;
  description: string;
}

interface Camera {
  id: number;
  cameraURL: string;
  description: string;
  status: boolean;
  gateId: number;
  cameraType: CameraType;
}

interface GateCamera {
  gateId: number;
  gateName: string;
  createDate: string;
  description: string;
  status: boolean;
  cameras: Camera[];
}

const CheckLicensePlateCard = () => {
  const BASE_URL_CAPTURE =
    process.env.EXPO_PUBLIC_BASE_URL_CAPTURE ||
    "https://security-gateway-camera-1.tools.kozow.com/capture-image";

  const { card } = useLocalSearchParams();
  // console.log("coi co lay dc card k: ", card);
  const router = useRouter();
  const qrLock = useRef(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isCameraLaunched, setIsCameraLaunched] = useState(false);
  const [capturedImage, setCapturedImage] = useState<ImageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );

  useEffect(() => {
    return () => {
      // Cleanup surface resources
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', () => true);
      }
    };
  }, []);

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
      if (!card || !cameraGate || !Array.isArray(cameraGate)) {
        console.log("Missing required data:", {
          cardVerification: card,
          cameraGate: !!cameraGate,
          isArray: Array.isArray(cameraGate),
        });
        return;
      }

      try {
        console.log("Processing card verification:", card);

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
              ImageURL: "",
              Image: bodyImageData.ImageFile,
            });
            // console.log("Body image captured successfully");
          }
        }

        // Chụp ảnh giày
        if (shoeCamera?.cameraURL) {
          const shoeImageUrl = `${shoeCamera.cameraURL}capture-image`;
          // console.log("Attempting to capture shoe image from:", shoeImageUrl);

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
            // console.log("Shoe image captured successfully");
          }
        }

        if (images.length > 0) {
          // console.log("Setting state with captured images:", images.length);

          // Cập nhật checkInData
          setCheckInData((prevData) => ({
            ...prevData,
            QrCardVerification: card as string,
            Images: images,
          }));

          // Cập nhật validCheckInData
          const shoeImage = images.find(
            (img) => img.ImageType === "CheckIn_Shoe"
          );
          if (shoeImage?.Image) {
            setValidCheckInData((prevData) => ({
              ...prevData,
              QRCardVerification: card as string,
              ImageBody: shoeImage.Image,
            }));
            // console.log("ValidCheckInData updated with shoe image");
          }
        } else {
          // console.error("No images were captured successfully");
          Alert.alert("Warning", "Không thể chụp ảnh. Vui lòng thử lại.");
        }
      } catch (error) {
        // console.error("Error in capture process:", error);
        Alert.alert(
          "Error",
          "Lỗi khi chụp ảnh. Vui lòng kiểm tra cấu hình camera và thử lại."
        );
      }
    };

    handleQrDataAndCapture().catch((error) => {
      // console.error("Error in handleQrDataAndCapture:", error);
    });
  }, [card, cameraGate]);

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
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("API Response:", result);
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
        await uploadImageToAPI(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Failed to take picture:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    const validateAndNavigate = async () => {
      if (
        !checkInData.QrCardVerification ||
        checkInData.Images.length === 0 ||
        checkInData.VehicleSession.vehicleImages.length !== 1 ||
        hasNavigated
      ) {
        return;
      }

      try {
        if (!hasNavigated) {
          setHasNavigated(true);
          // Thêm property __type để đánh dấu object có VehicleSession
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
  // console.log("check in dâtta: ", checkInData);
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
        </GestureHandlerRootView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CheckLicensePlateCard;
