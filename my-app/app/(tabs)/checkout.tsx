import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  Button,
  Alert,
  StyleSheet,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import { Link, useRouter } from "expo-router";
import Header from "@/components/Header";
import { useCheckOutMutation } from "@/redux/services/checkout.service";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Checkout = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const qrLock = useRef(false);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );
  const [checkOut, {isLoading}] = useCheckOutMutation();

  const [checkOutData, setCheckOutData] = useState({
    checkoutTime: 0,
    securityOutId: 0,
    gateOutId: Number(selectedGateId) || 0,
  });

  useEffect(() => {
    if (permission?.granted) {
      setIsPermissionGranted(true);
    }
  }, [permission]);
  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setIsPermissionGranted(status === "granted");
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          console.log("User ID from AsyncStorage:", storedUserId);
        } else {
          console.log("No userId found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      setCheckOutData((prevState) => ({
        ...prevState,
        securityInId: Number(userId) || 0,
      }));
    }
  }, [userId, selectedGateId]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      qrLock.current = true;
      console.log("Scanned QR Code Data:", data);
      setIsCameraActive(false);
      Alert.alert(
        "QR Code Scanned",
        "QR Code has been successfully scanned and added to the check-in data."
      );
    }
  };
  // console.log("DATA: ", checkInData);

  if (!isPermissionGranted) {
    return (
      <View>
        <Text>Permission not granted</Text>
        <Button title="Request permission" onPress={requestPermission}></Button>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header name="Đặng Dương" />
      <View className="flex-1 justify-center items-center px-4">
      <View>
            {isCameraActive ? (
              <View style={styles.cameraContainer}>
                <CameraView
                  style={styles.cameraView}
                  onBarcodeScanned={handleBarCodeScanned}
                />
                <View style={styles.scanningFrame} />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsCameraActive(false)}
                >
                  <Text style={styles.closeButtonText}>Close Camera</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => setIsCameraActive(true)}
              >
                <Text style={styles.buttonText}>Scan QR Code</Text>
              </TouchableOpacity>
            )}
          </View>
        
      </View>
    </SafeAreaView>
  );
};

export default Checkout;


const styles = StyleSheet.create({

  cameraContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    marginVertical: 20,
  },
  cameraView: {
    flex: 1,
  },
  scanningFrame: {
    position: "absolute",
    top: "30%",
    left: "30%",
    width: "40%",
    height: "30%",
    borderWidth: 2,
    borderColor: "yellow",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },

  scanButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    marginBottom: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
  },
});