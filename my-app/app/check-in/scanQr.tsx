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
  View,
} from "react-native";
import { Overlay } from "./OverLay";
import { useGetVisitByCredentialCardQuery } from "@/redux/services/visit.service";
import { useFocusEffect } from "@react-navigation/native";
import { useGetDataByCardVerificationQuery } from "@/redux/services/qrcode.service";
import { CheckInVer02, ValidCheckIn } from "@/Types/checkIn.type";
import VideoPlayer from "./streaming";
import { uploadToFirebase } from "@/firebase-config";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const [userId, setUserId] = useState<string | null>(null);
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );
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

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      setCheckInData((prevState) => ({
        ...prevState,
        SecurityInId: Number(userId) || 0,
      }));
    }
  }, [userId, selectedGateId]);

 
 
  const [autoCapture, setAutoCapture] = useState(false);
 
  const handleImageCapture = async (imageData: ImageData) => {
    try {
      setCapturedImage([imageData]);
      const formattedImageData = {
        ImageType: imageData.ImageType,
        ImageURL: "",
        Image: imageData.ImageFile || "",
      };

      setCheckInData((prev) => ({
        ...prev,
        Images: [formattedImageData],
      }));
  
      // const downloadUrl = await uploadToFirebase(
      //   imageData.imageFile,
      //   `${imageData.imageType}_${Date.now()}.jpg`
      // );
  
      // console.log("Image uploaded successfully:", downloadUrl);
  
      // Update state or pass the URL as needed
    } catch (error) {
      Alert.alert("Upload Error", "Failed to upload image to Firebase");
    }
  };
  

  useEffect(() => {
    if (qrCardData) {
      setAutoCapture(true);
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
  
       
      const hasRequiredData = checkInData.QrCardVerification && checkInData.Images.length > 0;
  
      if (cardVerification && !redirected.current) {
        qrLock.current = true;
  
        if (qrCardData && !isLoadingQr && !isFetchingQr && !isErrorQr && hasRequiredData) {
          redirected.current = true;
          await new Promise((resolve) => setTimeout(resolve, 500));
          router.push({
            pathname: "/check-in/CheckInOverall",
            params: {
              dataCheckIn: JSON.stringify(checkInData),
            },
          });
          resetState();
        } else if (!isLoadingQr && !isFetchingQr && (isErrorQr || !qrCardData)) {
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
            params: { credentialCardId: credentialCardId },
          });
          resetState();
        } else if (!isLoadingVisit && !isFetchingVisit && !visitNotFoundShown.current) {
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
  const handleGoBack = () => {
    resetState();
    router.back();
  };
  // console.log("CCCD: ", credentialCardId);
  // console.log("Card id: ", cardVerification);
  console.log("Log lay anh ben scan: ", checkInData);
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