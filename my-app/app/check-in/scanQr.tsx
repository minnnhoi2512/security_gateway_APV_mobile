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
import { CheckInVer02} from "@/Types/checkIn.type";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "@/components/Toast/ToastContext";
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

  const {
    data: qrCardData,
    isLoading: isLoadingQr,
    isError: isErrorQr,
    isFetching: isFetchingQr,
  } = useGetDataByCardVerificationQuery(cardVerification || "", {
    skip: !cardVerification,
  });

  const fetchCaptureImage = async (): Promise<ImageData | null> => {
    try {
      const response = await fetch(
        "https://security-gateway-camera-1.tools.kozow.com/capture-image-2",
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

  useEffect(() => {
    const handleQrDataAndCapture = async () => {
      if (qrCardData) {
        // console.log("QR Card Data received:", qrCardData);

        // if (qrCardData.cardImage) {
        //   setQrImage(`data:image/png;base64,${qrCardData.cardImage}`);
        // }

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
            pathname: "/check-in/CheckInOverall",
            params: {
              dataCheckIn: JSON.stringify(checkInData),
            },
          });

          resetState();
        } else if (
          !isLoadingQr &&
          !isFetchingQr &&
          (isErrorQr || !qrCardData)
        ) {
          showToast("Mã xác thực không hợp lệ", "error");
          // Alert.alert("Lỗi", "Mã xác thực không hợp lệ");
          resetState();
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
  console.log("CCCD: ", credentialCardId);
  console.log("Card id: ", cardVerification);
  console.log("Log lay anh ben scan: ", checkInData);
  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "Overview",
          headerShown: false,
        }}
      />
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={handleBarCodeScanned}
      />
      <Overlay />
      {(isProcessing ||
        isLoadingVisit ||
        isFetchingVisit ||
        isLoadingQr ||
        isFetchingQr) && (
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
        className="absolute top-14 right-4 bg-black bg-opacity-50 px-3 py-3 rounded"
        onPress={handleGoBack}
      >
        <Text className="text-white">Thoát Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.switchButton} onPress={handleGoToScanQr2}>
        <Text style={styles.switchButtonText}>Check in với xe</Text>
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
