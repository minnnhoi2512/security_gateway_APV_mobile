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
  const [scannedData, setScannedData] = useState<ScanData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [credentialCardId, setCredentialCardId] = useState<string | null>(null);

  const {
    data: visitOfUser,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetVisitByCredentialCardQuery(credentialCardId || "", {
    skip: !credentialCardId,
  });

  const parseQRData = (qrData: string): ScanData | null => {
    const [id, nationalId, name, dateOfBirth, gender, address, issueDate] = qrData.split("|");
    if (id && nationalId && name && dateOfBirth && gender && address && issueDate) {
      return { id, nationalId, name, dateOfBirth, gender, address, issueDate };
    }
    return null;
  };

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

  useEffect(() => {
    if (credentialCardId) {
      setIsProcessing(true);
      refetch();
    }
  }, [credentialCardId, refetch]);

  useEffect(() => {
    if (!isLoading && credentialCardId) {
      setIsProcessing(false);
      if (visitOfUser && Array.isArray(visitOfUser) && visitOfUser.length > 0) {
        handleVisitData();
      } else {
        Alert.alert("Thông báo", "Không có dữ liệu visit cho người dùng này.", [
          {
            text: "OK",
            onPress: () => {
              resetState();
              router.push({
                pathname: "/(tabs)/",
              });
            },
          },
        ]);
      }
    }
  }, [isLoading, visitOfUser, credentialCardId]);

  const resetState = () => {
    console.log("Resetting state...");
    qrLock.current = false;
    setScannedData(null);
    setCredentialCardId(null);
    setIsProcessing(false);
  };

  const handleVisitData = () => {
    if (visitOfUser && visitOfUser.length > 0 && scannedData) {
      Alert.alert(
        "Xác nhận thông tin",
        `Bạn có muốn đi đến chi tiết của: ${scannedData.name}?`,
        [
          {
            text: "Hủy",
            onPress: () => {
              router.push({
                pathname: "/(tabs)/Checkin",
                params: { data: JSON.stringify(scannedData) },
              });
              resetState();
              console.log("User cancelled, state reset.");
            },
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => {
              router.push({
                pathname: "/check-in/ListVisit",
                params: { data: JSON.stringify(visitOfUser) },
              });
              // resetState();
              console.log("Navigating to UserDetail with data:", scannedData);
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      console.log("Không có dữ liệu visit hoặc dữ liệu quét không hợp lệ.");
      resetState();
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current && !isProcessing) {
      qrLock.current = true;
      setIsProcessing(true);
      console.log("Scanned QR Code Data:", data);

      const parsedData = parseQRData(data);
      if (parsedData) {
        setScannedData(parsedData);
        setCredentialCardId(parsedData.id);
      } else {
        Alert.alert("Lỗi", "Dữ liệu quét không hợp lệ.");
        resetState();
      }
    } else {
      console.log("Scanning is locked or processing is in progress.");
    }
  };

  console.log("visit data: ", visitOfUser);
  console.log("CCCD ID: ", credentialCardId);
  console.log("Current scanned data:", scannedData);

  const handleGoBack = () => {
    router.back();
  };

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
      {isProcessing && (
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 10,
    fontSize: 16,
  },
});
