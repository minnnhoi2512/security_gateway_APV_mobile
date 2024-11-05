import React, { useEffect, useRef, useState } from "react";
import { CameraView } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Overlay } from "./OverLay";
import { useGetVisitByCredentialCardQuery } from "@/redux/services/visit.service";
import { useFocusEffect } from "@react-navigation/native";
import { useGetDataByCardVerificationQuery } from "@/redux/services/qrcode.service";
import { ValidCheckIn } from "@/Types/checkIn.type";
import { useValidCheckInMutation } from "@/redux/services/checkin.service";
import VideoPlayer from "../(tabs)/streaming";

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
  imageType: "Shoe";
  imageFile: string | null;
}

export default function Home() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const router = useRouter();
  const [scannedData, setScannedData] = useState<string>("");
  const visitNotFoundShown = useRef(false);
  const redirected = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [credentialCardId, setCredentialCardId] = useState<string | null>(null);
  const [cardVerification, setCardVerification] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<ImageData[]>([]);
  const {
    data: visitOfUser,
    isLoading: isLoadingVisit,
    error: isError,
    isFetching: isFetchingVisit,
  } = useGetVisitByCredentialCardQuery(credentialCardId || "", {
    skip: !credentialCardId,
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
    isFetching: isFetchingQr,
  } = useGetDataByCardVerificationQuery(cardVerification || "", {
    skip: !cardVerification,
  });
  const [resultValid, setResultValid] = useState();
  const [validCheckIn, { isLoading: isValidCheckingIn }] =
    useValidCheckInMutation();
  const [autoCapture, setAutoCapture] = useState(false);
  const [isCheckInEnabled, setIsCheckInEnabled] = useState(false);
  const [isReadyToNavigate, setIsReadyToNavigate] = useState(false);
  useEffect(() => {
    const validateCheckInData = async () => {
      const isQrValid = !!validCheckInData.QrCardVerification;
      const hasOneImage = validCheckInData.ImageShoe.length === 1;

      if (!isQrValid || !hasOneImage) {
        setIsCheckInEnabled(false);
        return;
      }

      try {
        const result = await validCheckIn(validCheckInData).unwrap();
        setIsCheckInEnabled(result);
        setResultValid(result);
        console.log("REsult valid", result);

        if (result && validCheckInData) {
          setIsReadyToNavigate(true);
        }
        
      } catch (error: any) {
        // console.error("Validation error:", error);

        const errorMessage =
          error.data?.message || "Please ensure all requirements are met.";

        Alert.alert("Đã xảy ra lỗi", errorMessage);

        setIsCheckInEnabled(false);
      }
    };

    validateCheckInData();
  }, [validCheckInData]);

  useEffect(() => {
    if (qrCardData) {
      setAutoCapture(true);
      // if (qrCardData.cardImage) {
      //   setQrImage(`data:image/png;base64,${qrCardData.cardImage}`);
      // }

      if (qrCardData.cardVerification) {
        setValidCheckInData((prevData) => ({
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
        // Nếu không phải CCCD thì là mã verification
        setCardVerification(scannedData);
        setValidCheckInData((prevData) =>({
          ...prevData,
          QrCardVerification: scannedData
        }))
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
      if (cardVerification && !redirected.current) {
        qrLock.current = true;

        if (qrCardData && !isLoadingQr && !isFetchingQr && !isErrorQr && resultValid) {
          redirected.current = true;
          await new Promise((resolve) => setTimeout(resolve, 500));
          router.push({
            pathname: "/check-in/CheckInOverall",
            params: {
              resultData: JSON.stringify(resultValid),
              validData: JSON.stringify(validCheckInData),
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
            pathname: "/check-in/ListVisit",
            params: { data: JSON.stringify(visitOfUser) },
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
    resultValid, 
    isLoadingQr,
    isFetchingQr,
    cardVerification,
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

  console.log("CCCD: ", credentialCardId);
  console.log("Card id: ", cardVerification);

  

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
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
          <Text style={styles.loadingText}>Đang xử lý...</Text>
        </View>
      )}

      <Pressable style={styles.backButton} onPress={handleGoBack}>
        <Text style={styles.backButtonText}>Quay về</Text>
      </Pressable>
    </SafeAreaView>
  );
}

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
