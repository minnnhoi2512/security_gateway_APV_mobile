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

interface ScanData {
  id: string;
  nationalId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  issueDate: string;
}

export default function Home() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const router = useRouter();
  const [scannedData, setScannedData] = useState<string>("");
  const processingRef = useRef(false);
  const redirected = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [credentialCardId, setCredentialCardId] = useState<string | null>(null);
  const [cardVerification, setCardVerification] = useState<string | null>(null);

  const {
    data: visitOfUser,
    isLoading: isLoadingVisit,
    error: isError,
    isFetching: isFetchingVisit,
  } = useGetVisitByCredentialCardQuery(credentialCardId || "", {
    skip: !credentialCardId,
  });

  const {
    data: qrCardData,
    isLoading: isLoadingQr,
    isError: isErrorQr,
    isFetching: isFetchingQr,
  } = useGetDataByCardVerificationQuery(cardVerification || "", {
    skip: !cardVerification,
  });

  const parseQRData = (qrData: string): ScanData | null => {
    const parts = qrData.split("|");
    if (parts.length === 7) {
      const [id, nationalId, name, dateOfBirth, gender, address, issueDate] = parts;
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
    processingRef.current = false;
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
          },
        },
        {
          text: "Hủy",
          onPress: () => {
            resetState();
          },
        },
      ]
    );
  };

  useEffect(() => {
    const handleNavigation = async () => {
      // Xử lý cho trường hợp quét mã QR verification
      if (cardVerification && !processingRef.current && !redirected.current) {
        processingRef.current = true;
        qrLock.current = true;

        if (qrCardData && !isLoadingQr && !isFetchingQr && !isErrorQr) {
          redirected.current = true;
          await new Promise(resolve => setTimeout(resolve, 500));
          router.push({
            pathname: "/check-in/UserDetail",
            params: { data: JSON.stringify(qrCardData) },
          });
          resetState();
        } else if (!isLoadingQr && !isFetchingQr && (isErrorQr || !qrCardData)) {
          Alert.alert("Lỗi", "Mã xác thực không hợp lệ");
          resetState();
        }
      }
      
      // Xử lý cho trường hợp quét CCCD
      else if (credentialCardId && !processingRef.current && !redirected.current) {
        processingRef.current = true;
        qrLock.current = true;

        if (visitOfUser && !isFetchingVisit && !isLoadingVisit && !isError) {
          redirected.current = true;
          await new Promise(resolve => setTimeout(resolve, 500));
          router.push({
            pathname: "/check-in/ListVisit",
            params: { data: JSON.stringify(visitOfUser) },
          });
          resetState();
        } else if (!isLoadingVisit && !isFetchingVisit) {
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
  ]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current && !processingRef.current) {
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
      {(isProcessing || isLoadingVisit || isFetchingVisit || isLoadingQr || isFetchingQr) && (
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 16,
  },
});