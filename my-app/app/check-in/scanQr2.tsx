import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  StyleSheet,
  AppState,
  Alert,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { CameraView } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useCallback, useRef, useEffect } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { CheckInVer02 } from "@/Types/checkIn.type";
import { useGetVisitByCredentialCardQuery } from "@/redux/services/visit.service";
import { useGetDataByCardVerificationQuery } from "@/redux/services/qrcode.service";
import Overlay from "./OverLay";
import { MaterialIcons } from "@expo/vector-icons";

interface ScanData {
  id: string;
  nationalId?: string;
  name: string;
  dateOfBirth: string;
  gender?: string;
  address?: string;
  issueDate?: string;
  level?: string;
}
const ScanQr2 = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const router = useRouter();
  const [scannedData, setScannedData] = useState<string>("");
  const visitNotFoundShown = useRef(false);
  const redirected = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [credentialCardId, setCredentialCardId] = useState<string | null>(null);
  const [cardVerification, setCardVerification] = useState<string | null>(null);

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

  useFocusEffect(
    useCallback(() => {
      setIsCameraActive(true);
      return () => {
        setIsCameraActive(false);
      };
    }, [])
  );

  const parseQRData = (qrData: string): ScanData | null => {
    const parts = qrData.split("|");
    if (parts.length === 7) {
      const [id, nationalId, name, dateOfBirth, gender, address, issueDate] =
        parts;
      return { id, nationalId, name, dateOfBirth, gender, address, issueDate };
    }
    return null;
  };
  const parseQRLicensePlateData = (qrData: string): ScanData | null => {
    const parts = qrData.split("\n");
    if (parts.length === 5) {
      const [id, name, dateOfBirth, level, address] = parts;
      return { id, name, dateOfBirth, level, address };
    }
    return null;
  };
  const isCredentialCard = (data: string): boolean => {
    return data.includes("|");
  };
  const isLicensePlate = (data: string): boolean => {
    return data.includes("\n");
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
      }else if (isLicensePlate(scannedData)) {
        const parsedData = parseQRLicensePlateData(scannedData);
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
              pathname: "/(tabs)",
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

      if (cardVerification && !redirected.current) {
        qrLock.current = true;
        if (qrCardData && !isLoadingQr && !isFetchingQr && !isErrorQr) {
          redirected.current = true;
          await new Promise((resolve) => setTimeout(resolve, 500));
          router.push({
            pathname: "/check-in/CheckLicensePlateCard",
            params: {
              card: cardVerification,
            },
          });

          resetState();
        } else if (
          !isLoadingQr &&
          !isFetchingQr &&
          (isErrorQr || !qrCardData)
        ) {
          Alert.alert("Lỗi", "Mã xác thực không hợp lệ");
          resetState();
        }
      } else if (credentialCardId && !redirected.current) {
        qrLock.current = true;
        if (visitOfUser && !isFetchingVisit && !isLoadingVisit && !isError) {
          redirected.current = true;
          await new Promise((resolve) => setTimeout(resolve, 500));
          router.push({
            pathname: "/check-in/ListVisitLicensePlate",
            params: { credentialCardId: credentialCardId },
          });
          resetState();
        } else if (
          !isLoadingVisit &&
          !isFetchingVisit &&
          !visitNotFoundShown.current
        ) {
          visitNotFoundShown.current = true;

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

  const handleGoToScanQr1 = () => {
    router.replace("/check-in/scanQr");
  };

  const handleGoBack = () => {
    router.back();
  };

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
    //       Camera Checkin 2
    //     </Text>
    //   </View>
    //   <TouchableOpacity
    //     className="absolute top-14 right-4 bg-black bg-opacity-50 px-3 py-3 rounded"
    //     onPress={handleGoBack}
    //   >
    //     <Text className="text-white">Thoát Camera</Text>
    //   </TouchableOpacity>
    //   <TouchableOpacity style={styles.switchButton} onPress={handleGoToScanQr1}>
    //     <Text style={styles.switchButtonText}>Check in bình thường</Text>
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
              Camera Checkin với xe
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

      <TouchableOpacity
        className="absolute bottom-5 ml-[70px] -translate-x-1/2 bg-blue-600 px-6 py-3 rounded-xl flex-row items-center space-x-2 shadow-lg"
        onPress={handleGoToScanQr1}
      >
        <MaterialIcons name="directions-car" size={24} color="white" />
        <Text className="text-white font-semibold text-lg">
          Check in bình thường
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ScanQr2;

const styles = StyleSheet.create({
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
    left: "44%",
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
