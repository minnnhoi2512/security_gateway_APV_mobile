import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraView } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  Alert,
  AppState,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
} from "react-native";
import { Overlay } from "../check-in/OverLay";
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
  const router = useRouter();
  const [scannedData, setScannedData] = useState<string>("");
  const [credentialCardId, setCredentialCardId] = useState<string | null>(null);
  const processingRef = useRef(false);

  const parseQRData = (qrData: string): ScanData => {
    const [id, nationalId, name, dateOfBirth, gender, address, issueDate] =
      qrData.split("|");
    return { id, nationalId, name, dateOfBirth, gender, address, issueDate };
  };

  const {
    data: visitData,
    error,
    isLoading,
    isFetching,
  } = useGetVisitorByCreadentialCardQuery(credentialCardId || "", {
    skip: !credentialCardId,
  });

  const resetStates = () => {
    setScannedData("");
    setCredentialCardId(null);
    qrLock.current = false;
    processingRef.current = false;
  };

  useFocusEffect(
    React.useCallback(() => {
      resetStates();
      return () => {
        resetStates();
      };
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

  // Separate useEffect for data fetching response
  useEffect(() => {
    if (!credentialCardId || processingRef.current) return;

    if (!isLoading && !isFetching) {
      processingRef.current = true;

      if (visitData?.visitorId && !isFetching && !isLoading && !error) {
        router.push({
          pathname: "/createVisit/FormCreate",
          params: {
            visitorId: visitData.visitorId,
          },
          
        });
        resetStates();
      } else {
        handleVisitorNotFound();
      }
    }
  }, [visitData, isLoading, isFetching]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current && !processingRef.current) {
      qrLock.current = true;
      setScannedData(data);
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
});