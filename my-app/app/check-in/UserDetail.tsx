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
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useGetVisitDetailByIdQuery } from "@/redux/services/visit.service";
import { useGetDataByCardVerificationQuery } from "@/redux/services/qrcode.service";
import { useGetCameraByGateIdQuery } from "@/redux/services/gate.service";
import { setGateInId, setImages, setQRCardVerification, setSecurityInId, ValidCheckInState } from "@/redux/slices/checkIn.slice";

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
  const dispatch = useDispatch();
  const checkInDataSlice = useSelector<any>((state) => state.validCheckIn) as ValidCheckInState;
  const { visitId } = useLocalSearchParams<{ visitId: string }>();
  const { data } = useLocalSearchParams<{ data: string }>();
  // const { visitDetailId } = useLocalSearchParams<{
  //   visitDetailId: string;
  // }>();
  // const { VerifiedId } = useLocalSearchParams<{
  //   VerifiedId: string;
  // }>();
  // const { verifiedType } = useLocalSearchParams<{
  //   verifiedType: string;
  // }>();
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );

  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const qrLock = useRef(false);
  const [hasShownError, setHasShownError] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup surface resources
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', () => true);
      }
    };
  }, []);

  // RTK QUERY

  // const {
  //   data: visitDetail,
  //   isLoading,
  //   isError,
  // } = useGetVisitDetailByIdQuery(visitId);

  //CHECKIN DATA
  // const [checkInData, setCheckInData] = useState<CheckInVer02>({
  //   VisitDetailId: Number(checkInDataSlice.VisitDetailId) || 0,
  //   SecurityInId: 0,
  //   GateInId: Number(selectedGateId) || 0,
  //   QrCardVerification: "",
  //   Images: [],
  // });
  // console.log("checkInData 1",checkInData);
  // const [validCheckInData, setValidCheckInData] = useState<ValidCheckIn>({
  //   CredentialCard: null,
  //   QRCardVerification: "",
  //   ImageShoe: [],
  // });

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

  // const {
  //   data: qrCardData,
  //   isLoading: isLoadingQr,
  //   isError: isErrorQr,
  // } = useGetDataByCardVerificationQuery(checkInData.QrCardVerification, {
  //   skip: !checkInData.QrCardVerification,
  // });
  useEffect(() => {
    if (checkInDataSlice.type === "QRCardVerified") {
      // setCheckInData((prevData) => ({
      //   ...prevData,
      //   QrCardVerification: checkInDataSlice.QrCardVerification || "",
      // }));
      setIsCameraActive(false);
      setIsProcessing(true);
      // console.log("checkInDataSlice 1", checkInDataSlice);
    } else {
      setIsCameraActive(true);
    }
  }, []);
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          // setCheckInData((prevState) => ({
          //   ...prevState,
          //   SecurityInId: Number(storedUserId) || 0,
          // }));
          dispatch(setSecurityInId(Number(storedUserId)));
          dispatch(setGateInId(Number(selectedGateId)));
        } else {
          console.log("No userId found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  // useEffect(() => {
  //   if (visitDetail && Array.isArray(visitDetail) && visitDetail.length > 0) {
  //     const credentialCard = visitDetail[0]?.visitor?.credentialsCard;

  //     setCheckInData((prevData) => ({
  //       ...prevData,
  //       CredentialCard: credentialCard,
  //     }));
  //     // setValidCheckInData((prevData) => ({
  //     //   ...prevData,
  //     //   CredentialCard: credentialCard,
  //     // }));
  //   }
  // }, [visitDetail]);

  // useEffect(() => {
  //   if (verifiedType === "QRCardVerified") {
  //     setCheckInData((prevData) => ({
  //       ...prevData,
  //       QrCardVerification: VerifiedId || "",
  //     }));
  //     setIsCameraActive(false);
  //   } else {
  //     setIsCameraActive(true);
  //   }
  // }, [verifiedType, VerifiedId]);
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




  // useEffect(() => {
  //   if (isErrorQr && !hasShownError) {
  //     setHasShownError(true);
  //     Alert.alert(
  //       "Lỗi",
  //       "Không tìm thấy dữ liệu QR. Vui lòng thử lại.",
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => {
  //             qrLock.current = false;
  //             setIsProcessing(false);
  //             setCheckInData(prev => ({...prev, QrCardVerification: ""}));
  //             router.back();
  //           }
  //         }
  //       ]
  //     );
  //   }
  // }, [isErrorQr]);

  useEffect(() => {
    const handleQrDataAndCapture = async () => {
      if (

        !cameraGate ||
        !Array.isArray(cameraGate)
      ) {
        console.log("Missing required data:", {
          // cardVerification: qrCardData.cardVerification,
          cameraGate: !!cameraGate,
          isArray: Array.isArray(cameraGate),
        });
        return;
      }

      try {
        const bodyCamera = cameraGate.find(
          (camera) => camera?.cameraType?.cameraTypeName === "CheckIn_Body"
        );

        const shoeCamera = cameraGate.find(
          (camera) => camera?.cameraType?.cameraTypeName === "CheckIn_Shoe"
        );

        const images: CapturedImage[] = [];
        // Chụp ảnh body
        if (bodyCamera?.cameraURL) {
          const bodyImageUrl = `${bodyCamera.cameraURL}capture-image`;

          const bodyImageData = await fetchWithTimeout(
            fetchCaptureImage(bodyImageUrl, "CheckIn_Body"),
            10000
          );
          if (bodyImageData.ImageFile) {
            images.push({
              ImageType: "CheckIn_Body",
              ImageURL: "",
              Image: bodyImageData.ImageFile,
            });
          }
        }

        // Chụp ảnh giày
        if (shoeCamera?.cameraURL) {
          const shoeImageUrl = `${shoeCamera.cameraURL}capture-image`;

          const shoeImageData = await fetchWithTimeout(
            fetchCaptureImage(shoeImageUrl, "CheckIn_Shoe"),
            10000
          );

          if (shoeImageData.ImageFile) {
            images.push({
              ImageType: "CheckIn_Shoe",
              ImageURL: "",
              Image: shoeImageData.ImageFile,
            });
          }
        }

        if (images.length > 0) {
          // Cập nhật checkInData
          // setCheckInData((prevData) => ({
          //   ...prevData,
          //   // QrCardVerification: qrCardData.cardVerification,
          //   Images: images,
          // }));
          dispatch(setImages(images));
          console.log("images", images);
          // Cập nhật validCheckInData
          // const shoeImage = images.find(
          //   (img) => img.ImageType === "CheckIn_Shoe"
          // );
          // if (shoeImage?.Image) {
          //   setValidCheckInData((prevData) => ({
          //     ...prevData,
          //     QRCardVerification: qrCardData.cardVerification,
          //     ImageBody: shoeImage.Image,
          //   }));
          //   console.log("ValidCheckInData updated with shoe image");
          // }
        } else {
          console.error("No images were captured successfully");
          Alert.alert("Warning", "Không thể chụp ảnh. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Error in capture process:", error);
        router.navigate("/(tabs)/checkin");
        Alert.alert(
          "Lỗi",
          "Lỗi khi chụp ảnh. Vui lòng kiểm tra cấu hình camera và thử lại."
        );
        return;
      }
    };

    handleQrDataAndCapture().catch((error) => {
      // console.error("Error in handleQrDataAndCapture:", error);
    });
  }, [cameraGate]);

  // useEffect(() => {
  //   if (qrCardData) {
  //     setIsProcessing(true);
  //     if (qrCardData.cardVerification) {
  //       setCheckInData((prevData) => ({
  //         ...prevData,
  //         QrCardVerification: qrCardData.cardVerification,
  //       }));
  //     } else {
  //       setIsCameraActive(true);
  //     }
  //   } else {
  //     setIsCameraActive(true);
  //   }
  // }, [data]);

  // useEffect(() => {
  //   if (qrCardData) {
  //     setIsProcessing(true);

  //     if (qrCardData.cardVerification) {
  //       setCheckInData((prevData) => ({
  //         ...prevData,
  //         QrCardVerification: qrCardData.cardVerification,
  //       }));
  //     }
  //   }
  // }, [qrCardData]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      qrLock.current = true;
      // setCheckInData((prevData) => ({
      //   ...prevData,
      //   QrCardVerification: data,
      // }));
      dispatch(setQRCardVerification(data));
      setIsProcessing(true);
      // console.log("Scanned QR Code Data:", data);
    }
  };

  useEffect(() => {
    const validateAndNavigate = async () => {
      if (
        !checkInDataSlice.QrCardVerification ||
        checkInDataSlice.Images?.length === 0 ||
        checkInDataSlice.Images === null ||
        hasNavigated
      ) {
        return;
      }
      // console.log("checkInDataSlice", checkInDataSlice);
      try {
        if (!hasNavigated) {
          setHasNavigated(true);
          // console.log("Check", checkInData)
          router.push({
            pathname: "/check-in/ValidCheckInScreen",
            // params: {
            //   dataCheckIn: JSON.stringify(checkInDataSlice),
            //   dataValid: JSON.stringify({
            //     VisitDetailId: checkInDataSlice.VisitDetailId,
            //     QRCardVerification: checkInDataSlice.QrCardVerification,
            //     ImageShoe:
            //       checkInDataSlice.Images?.find(
            //         (img) => img.ImageType === "CheckIn_Shoe"
            //       )?.Image || null,
            //   }),
            // },
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
  }, [checkInDataSlice, hasNavigated]);

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

  // if (isProcessing || isLoadingQr) {
  //   return (
  //     <View className="flex-1 items-center justify-center bg-backgroundApp">
  //       <ActivityIndicator size="large" color="#ffffff" />
  //       <Text className="text-white mt-4">Đang xử lý mã QR Code...</Text>
  //     </View>
  //   );
  // }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 mb-4">
      {isProcessing ? (
        <View className="flex-1 items-center justify-center bg-backgroundApp">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white mt-4">Đang xử lý mã QR Code...</Text>
        </View>
      ) : (

        <GestureHandlerRootView className="flex-1 ">
          <View className="w-full aspect-[2/4] relative mb-4">
            {isCameraActive && (
              <CameraView
                className="flex-1 w-full h-full"
                onBarcodeScanned={handleBarCodeScanned}
              />
            )}
            <Overlay />
            {(isProcessing) && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-xl" style={styles.loadingText}>
                  Đang xử lý...
                </Text>
              </View>
            )}
            <View className="absolute top-14 left-4 bg-white px-3 py-2 rounded-md shadow-lg">
              <Text className="text-green-700 text-sm font-semibold">
                Camera Checkin
              </Text>
            </View>
            <TouchableOpacity
              className="absolute top-14 right-4 bg-black bg-opacity-50 px-3 py-2 rounded-md shadow-lg"
              onPress={handleGoBack}
            >
              <Text className="text-white text-sm font-semibold">
                Thoát Camera
              </Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
                className="absolute top-14 right-4 bg-black bg-opacity-50 px-3 py-3 rounded"
                onPress={() => setIsCameraActive(false)}
              ></TouchableOpacity> */}
          </View>
        </GestureHandlerRootView>
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
  },
  switchButton: {
    position: "absolute",
    bottom: 20,
    left: "51%",
    transform: [{ translateX: -75 }],
    backgroundColor: "#0072C6",
    padding: 15,
    borderRadius: 8,
  },
  switchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
