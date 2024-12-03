import React, { useEffect, useRef, useState } from "react";
import { CameraView } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system";
import Overlay from "./OverLay";
import { useGetVisitByCredentialCardQuery } from "@/redux/services/visit.service";
import { useFocusEffect } from "@react-navigation/native";
import { useGetDataByCardVerificationQuery } from "@/redux/services/qrcode.service";
import { CheckInVer02, ValidCheckIn } from "@/Types/checkIn.type";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "@/components/Toast/ToastContext";
import { useGetCameraByGateIdQuery } from "@/redux/services/gate.service";
import { MaterialIcons } from "@expo/vector-icons";
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
  ImageType: "Shoe";
  ImageURL: string | null;
  ImageFile: string | null;
}

interface CapturedImage {
  ImageType: string;
  ImageURL: string;
  Image: string;
}
const scanQr = () => {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const router = useRouter();
  const [scannedData, setScannedData] = useState<string>("");
  const visitNotFoundShown = useRef(false);
  const redirected = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [credentialCardId, setCredentialCardId] = useState<string | null>(null);
  const [cardVerification, setCardVerification] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<ImageData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const alertShown = useRef(false);
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );
  const { showToast } = useToast();
  const {
    data: visitOfUser,
    isLoading: isLoadingVisit,
    error: isError,
    isFetching: isFetchingVisit,
  } = useGetVisitByCredentialCardQuery(credentialCardId || "", {
    skip: !credentialCardId,
  });

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

  const {
    data: qrCardData,
    isLoading: isLoadingQr,
    isError: isErrorQr,
    isFetching: isFetchingQr,
  } = useGetDataByCardVerificationQuery(cardVerification || "", {
    skip: !cardVerification,
  });

  const gateId = Number(selectedGateId) || 0;
  const {
    data: cameraGate,
    isLoading,
    isError: isErrorCamera,
  } = useGetCameraByGateIdQuery(
    { gateId },
    {
      skip: !gateId,
    }
  );

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
    const handleQrDataAndCapture = async () => {
      if (
        !qrCardData?.cardVerification ||
        !cameraGate ||
        !Array.isArray(cameraGate)
      ) {
        console.log("Missing required data:", {
          cardVerification: qrCardData?.cardVerification,
          cameraGate: !!cameraGate,
          isArray: Array.isArray(cameraGate),
        });
        return;
      }

      try {
        // console.log(
        //   "Processing card verification:",
        //   qrCardData.cardVerification
        // );

        // Tìm camera trực tiếp từ mảng cameraGate
        const bodyCamera = cameraGate.find(
          (camera) => camera?.cameraType?.cameraTypeName === "CheckIn_Body"
        );

        const shoeCamera = cameraGate.find(
          (camera) => camera?.cameraType?.cameraTypeName === "CheckIn_Shoe"
        );

        // console.log("Found cameras:", {
        //   bodyCamera: bodyCamera?.cameraURL,
        //   shoeCamera: shoeCamera?.cameraURL,
        // });

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
          }
        }

        if (images.length > 0) {
          // console.log("Setting state with captured images:", images.length);

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
            // console.log("ValidCheckInData updated with shoe image");
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
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
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

  useEffect(() => {
    if (qrCardData) {
      if (qrCardData.cardVerification) {
        setCheckInData((prevData) => ({
          ...prevData,
          QrCardVerification: qrCardData.cardVerification,
        }));
      }
    }
  }, [qrCardData]);

  const parseQRData = (qrData: string): ScanData | null => {
    const parts = qrData.split("|");
    if (parts.length === 7) {
      const [id, nationalId, name, dateOfBirth, gender, address, issueDate] =
        parts;
      return { id, nationalId, name, dateOfBirth, gender, address, issueDate };
    }
    return null;
  };

  const isCredentialCard = (data: string): boolean => {
    return data.includes("|");
  };

  const resetState = () => {
    console.log("Resetting state...");
    setScannedData("");
    setCredentialCardId(null);
    setCardVerification(null);
    setIsProcessing(false);
    qrLock.current = false;
  };
  useFocusEffect(
    React.useCallback(() => {
      resetState();
      redirected.current = false;
      return () => {};
    }, [])
  );

  useEffect(() => {
    if (scannedData) {
      if (isCredentialCard(scannedData)) {
        const parsedData = parseQRData(scannedData);
        if (parsedData) {
          setCredentialCardId(parsedData.id);
          setIsProcessing(true);
        } else {
          Alert.alert("Lỗi", "Mã QR không hợp lệ");
          resetState();
        }
      } else {
        setCardVerification(scannedData);
        setCheckInData((prevData) => ({
          ...prevData,
          QrCardVerification: scannedData,
        }));
        setIsProcessing(true);
      }
    }
  }, [scannedData]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        resetState();
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);
  const handleVisitNotFound = () => {
    setIsProcessing(false);
    Alert.alert(
      "Không tìm thấy dữ liệu",
      "Không tìm thấy dữ liệu cho ID này. Bạn sẽ được chuyển hướng đến tạo mới lịch hẹn",
      [
        {
          text: "OK",
          onPress: () => {
            router.push({
              pathname: "/(tabs)/createCustomer",
            });
            resetState();
            visitNotFoundShown.current = false;
          },
        },
        {
          text: "Hủy",
          onPress: () => {
            resetState();
            visitNotFoundShown.current = false;
          },
        },
      ]
    );
  };
  useEffect(() => {
    const handleNavigation = async () => {
      if (isLoadingVisit || isFetchingVisit) return;
      await new Promise((resolve) => setTimeout(resolve, 200));
      const hasRequiredData =
        checkInData.QrCardVerification && checkInData.Images.length > 0;
      if (cardVerification && !redirected.current) {
        qrLock.current = true;
        if (
          qrCardData &&
          !isLoadingQr &&
          !isFetchingQr &&
          !isErrorQr &&
          hasRequiredData
        ) {
          redirected.current = true;
          await new Promise((resolve) => setTimeout(resolve, 500));
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

          resetState();
          alertShown.current = false;
        } else if (
          !isLoadingQr &&
          !isFetchingQr &&
          (isErrorQr || !qrCardData)
        ) {
          if (!alertShown.current) {
            showToast("Mã xác thực không hợp lệ", "error");
            Alert.alert("Lỗi", "Mã xác thực không hợp lệ", [
              {
                text: "OK",
                onPress: () => {
                  resetState();
                  alertShown.current = false;
                },
              },
            ]);
            alertShown.current = true;
          }
        }
      } else if (credentialCardId && !redirected.current) {
        qrLock.current = true;
        if (visitOfUser && !isFetchingVisit && !isLoadingVisit && !isError) {
          redirected.current = true;
          await new Promise((resolve) => setTimeout(resolve, 500));
          router.push({
            pathname: "/check-in/ListVisit",
            params: { credentialCardId: credentialCardId },
          });
          resetState();
        } else if (
          !isLoadingVisit &&
          !isFetchingVisit &&
          !visitNotFoundShown.current
        ) {
          visitNotFoundShown.current = true;
          showToast("Không tìm thấy thông tin chuyến thăm", "error");
          handleVisitNotFound();
        }
      }
    };
    handleNavigation();
  }, [
    visitOfUser,
    isLoadingVisit,
    isFetchingVisit,
    credentialCardId,
    qrCardData,
    isLoadingQr,
    isFetchingQr,
    cardVerification,
    checkInData,
  ]);
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      qrLock.current = true;
      setScannedData(data);
      setIsProcessing(true);
      console.log("Scanned QR Code Data:", data);
    }
  };
  const handleGoBack = () => {
    resetState();
    router.back();
  };

  const handleGoToScanQr2 = () => {
    router.replace("/check-in/scanQr2");
  };
  // console.log("CCCD: ", credentialCardId);
  // console.log("Card id: ", cardVerification);
  // console.log("Log lay anh ben scan: ", checkInData);
  return (
    // <SafeAreaView style={StyleSheet.absoluteFillObject}>
    //   <Stack.Screen
    //     options={{
    //       title: "Overview",
    //       headerShown: false,
    //     }}
    //   />
    //   {Platform.OS === "android" ? <StatusBar hidden /> : null}
    //   <CameraView
    //     style={StyleSheet.absoluteFillObject}
    //     facing="back"
    //     onBarcodeScanned={handleBarCodeScanned}
    //   />
    //   <Overlay />
    //   {(isProcessing ||
    //     isLoadingVisit ||
    //     isFetchingVisit ||
    //     isLoadingQr ||
    //     isFetchingQr) && (
    //     <View style={styles.loadingContainer}>
    //       <ActivityIndicator size="large" color="#ffffff" />
    //       <Text className="text-xl" style={styles.loadingText}>
    //         Đang xử lý...
    //       </Text>
    //     </View>
    //   )}
    //   <View className="absolute top-14 left-4 bg-white px-3 py-2 rounded-md shadow-lg">
    //     <Text className="text-green-700 text-sm font-semibold">
    //       Camera Checkin
    //     </Text>
    //   </View>
    //   <TouchableOpacity
    //     className="absolute top-14 right-4 bg-black bg-opacity-50 px-3 py-3 rounded"
    //     onPress={handleGoBack}
    //   >
    //     <Text className="text-white">Thoát Camera</Text>
    //   </TouchableOpacity>
    //   <TouchableOpacity style={styles.switchButton} onPress={handleGoToScanQr2}>
    //     <Text style={styles.switchButtonText}>Check in với xe</Text>
    //   </TouchableOpacity>
    // </SafeAreaView>
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen options={{ title: "Overview", headerShown: false }} />
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={handleBarCodeScanned}
      />
      <Overlay />

      <View className="absolute top-60 left-0 right-0 items-center">
        <View className="bg-white/90 px-6 py-3 rounded-lg shadow-lg">
          <View className="flex-row items-center space-x-2">
            <MaterialIcons name="camera" size={20} color="#16a34a" />
            <Text className="text-green-700 text-sm font-bold">
              Camera Checkin
            </Text>
          </View>
        </View>
      </View>

      {(isProcessing ||
        isLoadingVisit ||
        isFetchingVisit ||
        isLoadingQr ||
        isFetchingQr) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-xl text-white mt-2">Đang xử lý...</Text>
        </View>
      )}

      <TouchableOpacity
        className="absolute top-16 right-4 bg-black/50 p-3 rounded-lg flex-row items-center space-x-2"
        onPress={handleGoBack}
      >
        <MaterialIcons name="close" size={20} color="white" />
        <Text className="text-white font-medium">Thoát</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={[
          styles.switchButton,
          { flexDirection: "row", alignItems: "center", gap: 8 },
        ]}
        onPress={handleGoToScanQr2}
      >
        <MaterialIcons name="directions-car" size={24} color="white" />
        <Text style={styles.switchButtonText}>Check in với xe</Text>
      </TouchableOpacity> */}
      <TouchableOpacity
        className="absolute bottom-5 ml-[95px] -translate-x-1/2 bg-blue-600 px-6 py-3 rounded-xl flex-row items-center space-x-2 shadow-lg"
        onPress={handleGoToScanQr2}
      >
        <MaterialIcons name="directions-car" size={24} color="white" />
        <Text className="text-white font-semibold text-lg">
          Check in với xe
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default scanQr;

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
