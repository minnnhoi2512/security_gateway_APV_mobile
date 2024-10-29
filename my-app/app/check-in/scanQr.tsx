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

  const [credentialCardId, setCredentialCardId] = useState<string | null>(null);

  const {
    data: visitOfUser,
    isLoading: isLoadingVisit,
    error: isError,
    isFetching: isFetchingVisit,
    refetch,
  } = useGetVisitByCredentialCardQuery(credentialCardId || "", {
    skip: !credentialCardId,
  });
  const parseQRData = (qrData: string): ScanData => {
    const [id, nationalId, name, dateOfBirth, gender, address, issueDate] =
      qrData.split("|");
    return { id, nationalId, name, dateOfBirth, gender, address, issueDate };
  };
  // const parseQRData = (qrData: string): ScanData | null => {
  //   const [id, nationalId, name, dateOfBirth, gender, address, issueDate] =
  //     qrData.split("|");
  //   if (
  //     id &&
  //     nationalId &&
  //     name &&
  //     dateOfBirth &&
  //     gender &&
  //     address &&
  //     issueDate
  //   ) {
  //     return { id, nationalId, name, dateOfBirth, gender, address, issueDate };
  //   }
  //   return null;
  // };

  const resetState = () => {
    console.log("Resetting state...");
    setScannedData('');
    setCredentialCardId(null);
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
      const parsedData = parseQRData(scannedData);
      setCredentialCardId(parsedData.id);
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
    if (!credentialCardId || processingRef.current || redirected.current)
      return;

    if (credentialCardId && !isLoadingVisit && !isFetchingVisit) {
      processingRef.current = true;
      qrLock.current = true;
      if (visitOfUser && !isFetchingVisit && !isLoadingVisit && !isError) {
        redirected.current = true;
        router.push({
          pathname: "/check-in/ListVisit",
          params: { data: JSON.stringify(visitOfUser) },
        });
        resetState();
      } else {
        handleVisitNotFound();
      }
    }
  }, [visitOfUser, isLoadingVisit, isFetchingVisit, credentialCardId]);

  // const handleVisitData = () => {
  //   if (visitOfUser && visitOfUser.length > 0 && scannedData) {
  //     Alert.alert(
  //       "Xác nhận thông tin",
  //       `Bạn có muốn đi đến chi tiết của: ${scannedData.name}?`,
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => {
  //             router.push({
  //               pathname: "/check-in/ListVisit",
  //               params: { data: JSON.stringify(visitOfUser) },
  //             });
  //             resetState();
  //             console.log("Navigating to UserDetail with data:", scannedData);
  //           },
  //         },
  //         {
  //           text: "Hủy",
  //           onPress: () => {
  //             router.push({
  //               pathname: "/(tabs)/checkin",
  //               params: { data: JSON.stringify(scannedData) },
  //             });
  //             resetState();
  //             console.log("User cancelled, state reset.");
  //           },
  //           style: "cancel",
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //   } else {
  //     console.log("Không có dữ liệu visit hoặc dữ liệu quét không hợp lệ.");
  //     resetState();
  //   }
  // };

  // useEffect(() => {
  //   if (credentialCardId) {
  //     setIsProcessing(true);
  //     refetch();
  //   }
  // }, [credentialCardId, refetch]);

  // useEffect(() => {
  //   if (credentialCardId && !isLoadingVisit && !isFetchingVisit) {
  //     setIsProcessing(false);
  //     if (visitOfUser && Array.isArray(visitOfUser) && visitOfUser.length > 0) {
  //       handleVisitData();
  //     } else {
  //       Alert.alert("Thông báo", "Không có dữ liệu visit cho người dùng này.", [
  //         {
  //           text: "Tạo mới lịch hẹn",
  //           onPress: () => {
  //             router.push({
  //               pathname: "/(tabs)/createCustomer",
  //             });
  //             resetState();
  //           },
  //         },
  //         {
  //           text: "Trở về",
  //           onPress: () => {
  //             router.push({
  //               pathname: "/(tabs)/checkin",
  //             });
  //             resetState();
  //           },
  //         },
  //       ]);
  //     }
  //   }
  // }, [isLoadingVisit, visitOfUser, isFetchingVisit, credentialCardId]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current && !processingRef.current) {
      qrLock.current = true;
      setScannedData(data);
      console.log("Scanned QR Code Data:", data);

      // const parsedData = parseQRData(data);
      // if (parsedData) {
      //   setScannedData(parsedData);
      //   setCredentialCardId(parsedData.id);
      // } else {
      //   Alert.alert("Lỗi", "Dữ liệu quét không hợp lệ.");
      //   resetState();
      // }
    }
  };

  // console.log("visit data: ", visitOfUser);
  console.log("CCCD ID: ", credentialCardId);
  console.log("Current scanned data:", scannedData);

  const handleGoBack = () => {
    resetState();
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
      {isLoadingVisit && (
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
