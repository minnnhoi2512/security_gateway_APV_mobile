import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraView } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import {
  Alert,
  AppState,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Overlay } from "../check-in/OverLay";
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
export default function ScanQrCreate() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const router = useRouter();

  const [scannedData, setScannedData] = useState<string>("");
  const [credentialCardId, setCredentialCardId] = useState<string | null>(null);
  const [alertDisplayed, setAlertDisplayed] = useState(false);

  const parseQRData = (qrData: string): ScanData => {
    const [id, nationalId, name, dateOfBirth, gender, address, issueDate] =
      qrData.split("|");
    return { id, nationalId, name, dateOfBirth, gender, address, issueDate };
  };

  const {
    data: visitData,
    error,
    isLoading,
  } = useGetVisitByCredentialCardQuery(credentialCardId || "", {
    skip: !credentialCardId,
  });

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
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (credentialCardId && !isLoading && !alertDisplayed) {
      qrLock.current = true;

      if (visitData) {

        router.push("/createVisit/FormCreate");
        console.log("Visit search:", visitData);
      } else {

        Alert.alert(
          "No Data Found",
          "Không tìm thấy dữ liệu cho ID này. Bạn sẽ được chuyển hướng đến tạo khách mới.",
          [
            {
              text: "OK",
              onPress: () => {
                router.push({
                  pathname: '/createVisitor/CreateVisitor',
                  params: { data: scannedData },
                });
                qrLock.current = false; 
                setAlertDisplayed(false); 
              },
            },
          ]
        );
        setAlertDisplayed(true);
      }
    }
  }, [credentialCardId, visitData, error, isLoading]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      qrLock.current = true;
      console.log("Scanned QR Code Data:", data);
      setScannedData(data); 
    }
  };

  console.log("scannedData: ", scannedData);
  console.log("credentialCardId: ", credentialCardId);

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
      {scannedData ? (
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>Scanned Data: {scannedData}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dataContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  dataText: {
    color: "white",
    fontSize: 16,
  },
});
