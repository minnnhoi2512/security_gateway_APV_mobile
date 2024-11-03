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
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  GestureHandlerRootView,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { SaveFormat } from "expo-image-manipulator";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";

import { uploadToFirebase } from "../../firebase-config";
import { CheckInVer02, ValidCheckIn } from "@/Types/checkIn.type";
import { useGetVisitDetailByIdQuery } from "@/redux/services/visit.service";
import {
  useGetDataByCardVerificationQuery,
  useShoeDetectMutation,
} from "@/redux/services/qrcode.service";
import {
  useCheckInMutation,
  useValidCheckInMutation,
} from "@/redux/services/checkin.service";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VideoPlayer from "../(tabs)/streaming";
interface ImageData {
  imageType: "Shoe";
  imageFile: string | null;
}

const UserDetail = () => {
  const { visitId } = useLocalSearchParams<{ visitId: string }>();
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const qrLock = useRef(false);
  const [userId, setUserId] = useState<string | null>(null);
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);

  const [capturedImage, setCapturedImage] = useState<ImageData[]>([]);
  const [resultValid, setResultValid] = useState();
  const [isVisible, setIsVisible] = useState(false);
  console.log("GATE ID", selectedGateId);
  const handleToggleView = () => {
    setIsVisible((prev) => !prev); // Đảo ngược trạng thái hiển thị
  };

  // RTK QUERY
  const [
    shoeDetect,
    { isLoading: isDetecting, isError: isDetectError, data: detectData },
  ] = useShoeDetectMutation();

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
    QrCardVerification: "",
    ImageShoe: [],
  });

  const handleImageCapture = (imageData: ImageData) => {
    setCapturedImage([imageData]);

    setValidCheckInData((prev) => ({
      ...prev,
      ImageShoe: [imageData],
    }));
  };
  const {
    data: qrCardData,
    isLoading: isLoadingQr,
    isError: isErrorQr,
  } = useGetDataByCardVerificationQuery(checkInData.QrCardVerification);

  const [validCheckIn, { isLoading: isValidCheckingIn }] =
    useValidCheckInMutation();
  const [isCheckInEnabled, setIsCheckInEnabled] = useState(false);

  const [autoCapture, setAutoCapture] = useState(false);
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
        SecurityInId: Number(userId) || 0,
      }));
    }
  }, [userId, selectedGateId]);

  useEffect(() => {
    if (visitDetail && Array.isArray(visitDetail) && visitDetail.length > 0) {
      // Lấy credentialsCard từ phần tử đầu tiên của mảng
      const credentialCard = visitDetail[0]?.visitor?.credentialsCard;

      console.log("Original Credential Card:", credentialCard);

      setCheckInData((prevData) => ({
        ...prevData,
        CredentialCard: credentialCard,
      }));

      // Nếu bạn cần cập nhật validCheckInData
      setValidCheckInData?.((prevData) => ({
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
  const handleNext = () => {
    router.push({
      pathname: "/check-in/CheckInOverall",
      params: {
        resultData: JSON.stringify(resultValid),
        validData: JSON.stringify(validCheckInData),
      },
    });
  };
  useEffect(() => {
    const validateCheckInData = async () => {
      const isQrValid = !!validCheckInData.QrCardVerification;
      const hasOneImage = validCheckInData.ImageShoe.length === 1;
      // const hasValidVisitId = validCheckInData.CredentialCard === null;

      if (!isQrValid || !hasOneImage) {
        setIsCheckInEnabled(false);
        return;
      }

      try {
        const result = await validCheckIn(validCheckInData).unwrap();
        setIsCheckInEnabled(result);
        // console.log("VALIDE RES: ", result);
        setResultValid(result);
      } catch (error) {
        console.error("Validation error:", error);
        setIsCheckInEnabled(false);
        Alert.alert(
          "Validation Error",
          "Please ensure all requirements are met."
        );
      }
    };

    validateCheckInData();
  }, [validCheckInData]);

  // console.log("CApture image: ", capturedImage);
  // console.log("Data passed: ", data);

  const resetQrScanning = () => {
    qrLock.current = false;
    setIsCameraActive(false);
    setQrImage(null);
    setCheckInData((prev) => ({
      ...prev,
      QrCardVerification: "",
    }));
  };

  useEffect(() => {
    if (qrCardData?.cardImage) {
      setQrImage(`data:image/png;base64,${qrCardData.cardImage}`);
    }
  }, [qrCardData]);

  useEffect(() => {
    
    if (data || qrCardData) {
      setAutoCapture(true);
      // Parse data nếu cần và cập nhật QrCardVerification
      const parsedData = JSON.parse(data);
      if (parsedData.cardVerification) {
        setCheckInData((prevData) => ({
          ...prevData,
          QrCardVerification: parsedData.cardVerification,
        }));
        setValidCheckInData((prevData) => ({
          ...prevData,
          QrCardVerification: parsedData.cardVerification,
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
      setAutoCapture(true);
      if (qrCardData.cardImage) {
        setQrImage(`data:image/png;base64,${qrCardData.cardImage}`);
      }

      if (qrCardData.cardVerification) {
        setCheckInData((prevData) => ({
          ...prevData,
          QrCardVerification: qrCardData.cardVerification,
        }));
        setValidCheckInData((prevData) => ({
          ...prevData,
          QrCardVerification: qrCardData.cardVerification,
        }));
      }
    }
  }, [qrCardData]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      qrLock.current = true;
      console.log("Scanned QR Code Data:", data);

      setCheckInData((prevData) => ({
        ...prevData,
        QrCardVerification: data,
      }));
      setValidCheckInData((prevData) => ({
        ...prevData,
        QrCardVerification: data,
      }));
      setIsCameraActive(false);
      setAutoCapture(true);
      Alert.alert(
        "Đã quét QR Code",
        "QR Code đã được quét thành công và sẽ hiển thị ảnh bên dưới"
      );
    }
  };

  console.log("DATA CI: ", checkInData);
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

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-xl font-semibold text-backgroundApp">
          Loading...
        </Text>
      </View>
    );
  }

  // if (isError) {
  //   return (
  //     <View className="flex-1 justify-center items-center bg-gray-100">
  //       <Text className="text-xl font-semibold text-red-500">
  //         Error fetching visit details.
  //       </Text>
  //     </View>
  //   );
  // }

  console.log("Valid check data: ", validCheckInData);

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
          {/* Photo Section */}
          <Text className="text-xl font-bold text-gray-800 mb-4">Chụp ảnh</Text>
          <View>
            {/* <Button
              title={isVisible ? "Hide Video Player" : "Show Video Player"}
              onPress={handleToggleView}
            /> */}

            <View
              style={{
                opacity: isVisible ? 1 : 0,
                height: isVisible ? "auto" : 0,
              }}
            >
              <VideoPlayer
                onCaptureImage={handleImageCapture}
                autoCapture={autoCapture}
              />
            </View>
          </View>

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

          {/* QR Scanner */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Hình ảnh QR Code
            </Text>

            {isCameraActive ? (
              <View className="w-full aspect-[3/4] relative mb-4">
                <CameraView
                  onBarcodeScanned={handleBarCodeScanned}
                  className="flex-1"
                />
                <View className="absolute top-[30%] left-[30%] w-[40%] h-[30%] border-2 border-yellow-400 rounded-lg" />
                <TouchableOpacity
                  onPress={() => setIsCameraActive(false)}
                  className="absolute top-2 right-2 bg-black/50 p-2 rounded"
                >
                  <Text className="text-white">Thoát Camera</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {qrImage ? (
                  <View className="mb-4">
                    <Text className="text-center">
                      Mã thẻ: {checkInData.QrCardVerification}
                    </Text>
                    <Image
                      source={{ uri: qrImage }}
                      className="w-full h-48 rounded-lg"
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      onPress={resetQrScanning}
                      className="mt-2 bg-backgroundApp p-3 rounded-lg"
                    >
                      <Text className="text-white text-center">
                        Quét lại QR Code
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setIsCameraActive(true)}
                    className="bg-backgroundApp p-4 rounded-lg active:bg-backgroundApp/80"
                  >
                    <Text className="text-white text-center text-lg font-medium">
                      Quét QR Code
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Check In Button */}

          <TouchableOpacity
            onPress={handleNext}
            className="p-4 rounded-lg bg-backgroundApp"
          >
            <Text className="text-white text-center text-lg font-medium">
              Tiếp theo
            </Text>
          </TouchableOpacity>
        </GestureHandlerRootView>
      </ScrollView>
    </SafeAreaView>
  );
};
export default UserDetail;
