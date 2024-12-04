import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { CameraView } from "expo-camera";

import Overlay from "../check-in/OverLay";
import { useGetVisitorByCreadentialCardQuery } from "@/redux/services/visitor.service";

interface ScanData {
  id: string;
  nationalId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  issueDate: string;
}

export default function ScanQrCreate() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const processingRef = useRef(false);
  const redirected = useRef(false);
  const router = useRouter();
  const [scannedData, setScannedData] = useState<string>("");
  const [credentialCardId, setCredentialCardId] = useState<string | null>(null);
  const parseQRData = (qrData: string): ScanData => {
    const [id, nationalId, name, dateOfBirth, gender, address, issueDate] =
      qrData.split("|");
    return { id, nationalId, name, dateOfBirth, gender, address, issueDate };
  };

  // const {
  //   data: visitData,
  //   error,
  //   isLoading,
  //   isFetching,
  // } = useGetVisitorByCreadentialCardQuery(credentialCardId || "", {
  //   skip: !credentialCardId,
  //   refetchOnMountOrArgChange: 2,
  //   refetchOnFocus: true,
  // });

  const {
    data: visitData,
    error,
    isLoading,
    isFetching,
    refetch
  } = useGetVisitorByCreadentialCardQuery(credentialCardId || "", {
    skip: !credentialCardId,
    refetchOnFocus: true
  });
  
  // Add this useEffect to trigger refetch when credentialCardId changes
  useEffect(() => {
    if (credentialCardId) {
      refetch();
    }
  }, [credentialCardId, refetch]);
  
 
 

  const resetStates = () => {
    setScannedData("");
    setCredentialCardId(null);
    qrLock.current = false;
    processingRef.current = false;
  };

  useFocusEffect(
    React.useCallback(() => {
      resetStates();
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
        resetStates();
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const handleVisitorNotFound = () => {
    Alert.alert(
      "Không tìm thấy dữ liệu",
      "Không tìm thấy dữ liệu cho ID này. Bạn sẽ được chuyển hướng đến tạo khách mới.",
      [
        {
          text: "OK",
          onPress: () => {
            router.push({
              pathname: "/createVisitor/CreateVisitor",
              params: { data: scannedData },
            });
            resetStates();
          },
        },
        {
          text: "Hủy",
          onPress: () => {
            resetStates();
          },
        },
      ]
    );
  };

  // useEffect(() => {
  //   if (!credentialCardId || processingRef.current || redirected.current)
  //     return;

  //   if (credentialCardId && !isLoading && !isFetching) {
  //     processingRef.current = true;
  //     qrLock.current = true;
  //     if (visitData?.visitorId && !isFetching && !isLoading && !error) {
  //       redirected.current = true;
  //       router.push({
  //         pathname: "/createVisit/FormCreate",
  //         params: {
  //           visitorId: visitData.visitorId,
  //         },
  //       });
  //       resetStates();
  //     } else if (!visitData || error) {
  //       handleVisitorNotFound();
  //     }
  //   }
  // }, [visitData, isLoading, isFetching, credentialCardId]);

  useEffect(() => {
    if (!credentialCardId || processingRef.current || redirected.current)
      return;
  
    if (credentialCardId && !isLoading && !isFetching) {
      processingRef.current = true;
      qrLock.current = true;
      if (visitData?.visitorId && !isFetching && !isLoading && !error) {
        redirected.current = true;
        router.push({
          pathname: "/createVisit/FormCreate",
          params: {
            visitorId: visitData.visitorId,
          },
        });
        resetStates();
      } else if (!visitData || error) {
        handleVisitorNotFound();
      }
    }
  }, [visitData, isLoading, isFetching, credentialCardId]);
  

  

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current && !processingRef.current) {
      qrLock.current = true;
      setScannedData(data);
      console.log("QR SS QUET MOI", data);
    }
  };

  const handleGoBack = () => {
    resetStates();
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

      <View className="absolute top-14 left-4 bg-white px-3 py-2 rounded-md shadow-lg">
        <Text className="text-green-700 text-sm font-semibold">
          Camera Tạo mới
        </Text>
      </View>

      <TouchableOpacity
        className="absolute top-14 right-4 bg-black bg-opacity-50 px-3 py-3 rounded"
        onPress={handleGoBack}
      >
        <Text className="text-white">Thoát Camera</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
