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
  const [isValidating, setIsValidating] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [capturedImage, setCapturedImage] = useState<ImageData[]>([]);
  const [resultValid, setResultValid] = useState();
  const [isVisible, setIsVisible] = useState(false);
  console.log("GATE ID", selectedGateId);
  const handleToggleView = () => {
    setIsVisible((prev) => !prev);
  };

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
  // useEffect(() => {
  //   const validateCheckInData = async () => {
  //     const isQrValid = !!validCheckInData.QrCardVerification;
  //     const hasOneImage = validCheckInData.ImageShoe.length === 1;

  //     if (!isQrValid || !hasOneImage) {
  //       setIsCheckInEnabled(false);
  //       return;
  //     }

  //     try {
  //       const result = await validCheckIn(validCheckInData).unwrap();
  //       setIsCheckInEnabled(result);
  //       setResultValid(result);
  //     } catch (error: any) {
  //       // console.error("Validation error:", error);

  //       const errorMessage = error.data?.message || "Please ensure all requirements are met.";

  //       Alert.alert("Đã xảy ra lỗi", errorMessage);

  //       setIsCheckInEnabled(false);

  //     }
  //   };

  //   validateCheckInData();
  // }, [validCheckInData]);

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
    if (qrCardData) {
      setAutoCapture(true);

      if (qrCardData.cardVerification) {
        setCheckInData((prevData) => ({
          ...prevData,
          QrCardVerification: qrCardData.cardVerification,
        }));
        setValidCheckInData((prevData) => ({
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

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      qrLock.current = true;
      console.log("Scanned QR Code Data:", data);

      // Cập nhật state với QR code data
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

      // Show thông báo quét thành công
      // Alert.alert(
      //   "Đã quét QR Code",
      //   "QR Code đã được quét thành công và sẽ hiển thị ảnh bên dưới"
      // );
    }
  };

  useEffect(() => {
    const validateAndNavigate = async () => {
      if (
        !validCheckInData.QrCardVerification ||
        validCheckInData.ImageShoe.length !== 1 ||
        isValidating ||
        hasNavigated
      ) {
        return;
      }

      try {
        setIsValidating(true);
        const result = await validCheckIn(validCheckInData).unwrap();

        if (result && !hasNavigated) {
          setHasNavigated(true);
          router.push({
            pathname: "/check-in/CheckInOverall",
            params: {
              resultData: JSON.stringify(result),
              validData: JSON.stringify(validCheckInData),
            },
          });
        }
      } catch (error: any) {
        // console.log("ERR", error);
        
        const errorMessage =
          error.data?.message || "Please ensure all requirements are met.";
        Alert.alert("Đã xảy ra lỗi", errorMessage);
      } finally {
        setIsValidating(false);
      }
    };

    validateAndNavigate();
  }, [validCheckInData, hasNavigated]);

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
          </View>
        </GestureHandlerRootView>
      </ScrollView>
      {/* <View className="flex-1 justify-center">
        {isValidating && (
          <View className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className="text-white mt-2">Đang xử lý...</Text>
          </View>
        )}
      </View> */}

      {( isValidating) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Đang xử lý...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};
export default UserDetail;

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    padding: 10,
    backgroundColor: "black",
    borderRadius: 5,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 10,
    fontSize: 16,
  },
});
