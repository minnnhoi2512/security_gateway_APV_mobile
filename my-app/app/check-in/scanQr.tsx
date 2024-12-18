import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraView } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  Dimensions,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system";
import Overlay from "./OverLay";
import { useGetVisitByCredentialCardQuery } from "@/redux/services/visit.service";
import { useFocusEffect } from "@react-navigation/native";
import { useGetDataByCardVerificationQuery } from "@/redux/services/qrcode.service";
import { CheckInVer02, ValidCheckIn } from "@/Types/checkIn.type";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "@/components/Toast/ToastContext";
import { useGetCameraByGateIdQuery } from "@/redux/services/gate.service";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { fetchWithTimeout } from "@/hooks/util";
import { setCredentialCard, setIsVehicle, setQRCardVerification, setType, setValidCheckIn, ValidCheckInState } from "@/redux/slices/checkIn.slice";
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
interface ImageData {
  ImageType: "Shoe";
  ImageURL: string | null;
  ImageFile: string | null;
}

interface CapturedImage {
  ImageType: string;
  ImageURL: string;
  Image: string;
}
type CameraType = "QR" | "LICENSE" | "OTHER_TYPE";
const { width, height } = Dimensions.get("window");
const scanQr = () => {
  const dispatch = useDispatch();
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const router = useRouter();
  const [scannedData, setScannedData] = useState<string>("");
  const visitNotFoundShown = useRef(false);
  // const redirected = useRef(false);
  const [credentialCardId, setCredentialCardId] = useState<string | null>(null);
  const [cardVerification, setCardVerification] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<ImageData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scanType, setScanType] = useState<"normal" | "license">("normal");
  const alertShown = useRef(false);
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );
  const [cameraType, setCameraType] = useState<CameraType>("OTHER_TYPE");
  const [activeCamera, setActiveCamera] = useState<"QR" | "LICENSE">("QR");
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [hasScanned, setHasScanned] = useState(false);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const checkInDataSlice = useSelector((state: RootState) => state.validCheckIn) as ValidCheckInState;
  const [checkInData, setCheckInData] = useState<ValidCheckInState>(checkInDataSlice);
  // console.log("checkInData", checkInData);
  useEffect(() => {
    return () => {
      // Cleanup surface resources
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', () => true);
      }
    };
  }, []);

  useEffect(() => {
    const initCamera = async () => {
      setIsCameraInitialized(false);
      await new Promise((resolve) => setTimeout(resolve, 100));
      setIsCameraInitialized(true);
    };

    if (activeCamera) {
      initCamera();
    }

    return () => {
      setIsCameraInitialized(false);
    };
  }, [activeCamera]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCameraReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup camera resources
      setIsCameraReady(false);
      resetState();
    };
  }, []);

  const { showToast } = useToast();
  // const {
  //   data: visitOfUser,
  //   isLoading: isLoadingVisit,
  //   error: isError,
  //   isFetching: isFetchingVisit,
  // } = useGetVisitByCredentialCardQuery(
  //   { VerifiedId: credentialCardId || "", verifiedType: "CredentialCard" },
  //   {
  //     skip: !credentialCardId,
  //   }
  // );

  // const [checkInData, setCheckInData] = useState<CheckInVer02>({
  //   VisitDetailId: null,
  //   SecurityInId: 0,
  //   GateInId: Number(selectedGateId) || 0,
  //   QrCardVerification: "",
  //   Images: [],
  // });

  const [validCheckInData, setValidCheckInData] = useState<ValidCheckIn>({
    VisitDetailId: null,
    QRCardVerification: "",
    ImageShoe: [],
  });

  // const {
  //   data: qrCardData,
  //   isLoading: isLoadingQr,
  //   isError: isErrorQr,
  //   isFetching: isFetchingQr,
  // } = useGetDataByCardVerificationQuery(cardVerification || "", {
  //   skip: !cardVerification,
  // });

  const gateId = Number(selectedGateId) || 0;
  const {
    data: cameraGate,
    isLoading,
    isError: isErrorCamera,
  } = useGetCameraByGateIdQuery(
    { gateId },
    {
      skip: !gateId,
    }
  );

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Camera permission is required to use this feature"
        );
      }
    })();
  }, []);

  const fetchCaptureImage = async (
    url: string,
    imageType: string
  ): Promise<{ ImageType: string; ImageFile: string | null }> => {
    try {
      const response = await fetch(url, { method: "GET" });

      if (!response.ok) {
        console.error("HTTP Response Status:", response.status);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const fileUri = `${FileSystem.cacheDirectory}captured-image-${imageType}.jpg`;

      const fileSaved = await new Promise<string | null>((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onloadend = async () => {
          const base64data = fileReader.result?.toString().split(",")[1];
          if (base64data) {
            await FileSystem.writeAsStringAsync(fileUri, base64data, {
              encoding: FileSystem.EncodingType.Base64,
            });
            resolve(fileUri);
          } else {
            reject(null);
          }
        };
        fileReader.readAsDataURL(blob);
      });

      return {
        ImageType: imageType,
        ImageFile: fileSaved,
      };
    } catch (error) {
      console.error(`Failed to fetch ${imageType} image:`, error);
      Alert.alert(
        "Error",
        `Failed to fetch ${imageType} image. Please try again.`
      );
      return { ImageType: imageType, ImageFile: null };
    }
  };

  useEffect(() => {
    const handleQrDataAndCapture = async () => {
      if (
        // !qrCardData?.cardVerification ||
        !cameraGate ||
        !Array.isArray(cameraGate)
      ) {
        console.log("Missing required data:", {
          // cardVerification: qrCardData?.cardVerification,
          cameraGate: !!cameraGate,
          isArray: Array.isArray(cameraGate),
        });
        return;
      }

      try {
        const bodyCamera = cameraGate.find(
          (camera) => camera?.cameraType?.cameraTypeName === "CheckIn_Body"
        );

        const shoeCamera = cameraGate.find(
          (camera) => camera?.cameraType?.cameraTypeName === "CheckIn_Shoe"
        );

        const images: CapturedImage[] = [];

        if (bodyCamera?.cameraURL) {
          const bodyImageUrl = `${bodyCamera.cameraURL}capture-image`;
          // console.log("Attempting to capture body image from:", bodyImageUrl);
          const bodyImageData = await fetchWithTimeout(
            fetchCaptureImage(bodyImageUrl, "CheckIn_Body"),
            10000
          );

          if (bodyImageData.ImageFile) {
            images.push({
              ImageType: "CheckIn_Body",
              ImageURL: "",
              Image: bodyImageData.ImageFile,
            });
            // console.log("Body image captured successfully");
          }
        }

        if (shoeCamera?.cameraURL) {
          const shoeImageUrl = `${shoeCamera.cameraURL}capture-image`;
          // console.log("Attempting to capture shoe image from:", shoeImageUrl);

          const shoeImageData = await fetchWithTimeout(
            fetchCaptureImage(shoeImageUrl, "CheckIn_Shoe"),
            10000
          );

          if (shoeImageData.ImageFile) {
            images.push({
              ImageType: "CheckIn_Shoe",
              ImageURL: "",
              Image: shoeImageData.ImageFile,
            });
          }
        }

        if (images.length > 0) {
          // console.log("Setting state with captured images:", images.length);

          // setCheckInData((prevData) => ({
          //   ...prevData,
          //   // QrCardVerification: qrCardData.cardVerification,
          //   Images: images,
          // }));

          const shoeImage = images.find(
            (img) => img.ImageType === "CheckIn_Shoe"
          );
          if (shoeImage?.Image) {
            setValidCheckInData((prevData) => ({
              ...prevData,
              // QRCardVerification: qrCardData.cardVerification,
              ImageBody: shoeImage.Image,
            }));
            // console.log("ValidCheckInData updated with shoe image");
          }
        } else {
          console.error("No images were captured successfully");
          Alert.alert("Warning", "Không thể chụp ảnh. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Error in capture process:", error);
        router.navigate("/(tabs)/checkin");
        Alert.alert(
          "Lỗi",
          "Lỗi khi chụp ảnh. Vui lòng kiểm tra cấu hình camera và thử lại."
        );
        return;
      }
    };

    handleQrDataAndCapture().catch((error) => {
      // console.error("Error in handleQrDataAndCapture:", error);
    });
  }, [cameraGate]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          // setCheckInData((prevState) => ({
          //   ...prevState,
          //   SecurityInId: Number(storedUserId) || 0,
          // }));
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };
    fetchUserId();
  }, []);

  // useEffect(() => {
  //   if (qrCardData) {
  //     if (qrCardData.cardVerification) {
  //       setCheckInData((prevData) => ({
  //         ...prevData,
  //         QrCardVerification: qrCardData.cardVerification,
  //       }));
  //     }
  //   }
  // }, [qrCardData]);

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
    qrLock.current = false;
  };
  useFocusEffect(
    React.useCallback(() => {
      resetState();
      // redirected.current = false;
      return () => { };
    }, [])
  );

  useEffect(() => {
    if (scannedData) {
      console.log("scannedData", scannedData);
      
      if (isCredentialCard(scannedData)) {
        const parsedData = parseQRData(scannedData);
        console.log(scannedData);

        if (parsedData) {
          console.log("setCredentialCardId 1", parsedData.id)
          setCredentialCardId(parsedData.id);
        } else {
          Alert.alert("Lỗi", "Mã QR không hợp lệ");
          resetState();
        }
      } else if (isLicensePlate(scannedData)) {
        const parsedData = parseQRLicensePlateData(scannedData);

        if (parsedData) {
          // console.log("setCredentialCardId 2", parsedData.id)
          setCredentialCardId(parsedData.id);
        } else {
          Alert.alert("Lỗi", "Mã QR không hợp lệ");
          resetState();
        }
      } else {
        setCardVerification(scannedData);
        // setCheckInData((prevData) => ({
        //   ...prevData,
        //   QrCardVerification: scannedData,
        // }));
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
    if (scanType !== "normal" || !scannedData) return;

    // if (isLoadingVisit || isFetchingVisit) return;

    // const hasRequiredData =
    //   checkInData.QrCardVerification && checkInData.Images.length > 0;
    // if (qrLock.current) return; // Prevent multiple simultaneous operations
    if (cardVerification) {

      // setCheckInData((prevData) => ({
      //   ...prevData,
      //   type: "QRCardVerified",
      //   isVehicle: false,
      //   QrCardVerification: cardVerification,
      // }));
      // dispatch(setValidCheckIn(checkInData))
      dispatch(setQRCardVerification(cardVerification))
      dispatch(setType("QRCardVerified"))
      dispatch(setIsVehicle(false))
      router.push({
        pathname: "/check-in/ListVisit",
        // params: { VerifiedId: cardVerification, type: "QRCardVerified", isVehicle: "false" },
      });
      resetState();
      console.log("QrCardVerified 1", cardVerification)
      console.log("QrCardVerified", checkInData)
      qrLock.current = true; // Set the lock
      // qrLock.current = false;
      // setIsCameraActive(false);


      // if (
      //   qrCardData &&
      //   !isLoadingQr &&
      //   !isFetchingQr &&
      //   !isErrorQr &&
      //   hasRequiredData
      // ) {
      //   // redirected.current = true;

      //   router.push({
      //     pathname: "/check-in/ValidCheckInScreen",
      //     params: {
      //       dataCheckIn: JSON.stringify(checkInData),
      //       dataValid: JSON.stringify({
      //         CredentialCard: checkInData.CredentialCard,
      //         QRCardVerification: checkInData.QrCardVerification,
      //         ImageShoe:
      //           checkInData.Images.find(
      //             (img) => img.ImageType === "CheckIn_Shoe"
      //           )?.Image || null,
      //       }),
      //     },
      //   });

      //   resetState();
      //   alertShown.current = false;
      // } else if (!isLoadingQr && !isFetchingQr && (isErrorQr || !qrCardData)) {
      //   if (!alertShown.current) {
      //     // showToast("Mã xác thực không hợp lệ", "error");
      //     Alert.alert("Lỗi", "Mã xác thực không hợp lệ 1", [
      //       {
      //         text: "OK",
      //         onPress: () => {
      //           resetState();
      //           alertShown.current = false;
      //         },
      //       },
      //     ]);
      //     alertShown.current = true;
      //   }
      // }
    } else if (credentialCardId && isCameraActive) {

      // if (visitOfUser && !isFetchingVisit && !isLoadingVisit && !isError) {
      // redirected.current = true;
      // setCheckInData((prevData) => ({
      //   ...prevData,
      //   type: "CredentialCard",
      //   isVehicle: false,
      //   CredentialCard: credentialCardId,
      // }));
      // dispatch(setValidCheckIn(checkInData))
      dispatch(setCredentialCard(credentialCardId))
      dispatch(setType("CredentialCard"))
      dispatch(setIsVehicle(false))

      router.push({
        pathname: "/check-in/ListVisit",
        params: { VerifiedId: credentialCardId, type: "CredentialCard", isVehicle: "false" },
      });
      resetState();
      console.log("CredentialCard", credentialCardId)
      console.log("CredentialCard 11", checkInData)
      qrLock.current = true;
      // setIsCameraActive(false);
      // } else if (
      //   !isLoadingVisit &&
      //   !isFetchingVisit &&
      //   !visitNotFoundShown.current
      // ) {
      //   visitNotFoundShown.current = true;
      //   showToast("Không tìm thấy thông tin chuyến thăm", "error");
      //   handleVisitNotFound();
      // }
    }
  }, [
    scanType,
    scannedData,
    // visitOfUser,
    // isLoadingVisit,
    // isFetchingVisit,
    credentialCardId,
    // qrCardData,
    // isLoadingQr,
    // isFetchingQr,
    cardVerification,
    // checkInData,
  ]);

  useEffect(() => {
    if (scanType !== "license" || !scannedData) return;

    // if (isLoadingVisit || isFetchingVisit) return;

    const handleLicenseScan = async () => {
      if (cardVerification) {
        // if (qrCardData && !isLoadingQr && !isFetchingQr && !isErrorQr) {
        // redirected.current = true;
        await new Promise((resolve) => setTimeout(resolve, 500));
        // console.log("Xe cardcard")
        // setCheckInData((prevData) => ({
        //   ...prevData,
        //   type: "QRCardVerified",
        //   isVehicle: true,
        //   QrCardVerification: cardVerification,
        // }));
        // dispatch(setValidCheckIn(checkInData))
        dispatch(setQRCardVerification(cardVerification))
        dispatch(setType("QRCardVerified"))
        dispatch(setIsVehicle(true))
        router.push({
          pathname: "/check-in/ListVisit",
          params: { VerifiedId: cardVerification, type: "QRCardVerified", isVehicle: "true" },
        });
        // router.push({
        //   pathname: "/check-in/CheckLicensePlateCard",
        //   params: { card: cardVerification },
        // });
        resetState();
        qrLock.current = true;
        // setIsCameraActive(false);
        // } else if (
        //   !isLoadingQr &&
        //   !isFetchingQr &&
        //   (isErrorQr || !qrCardData)
        // ) {
        //   Alert.alert("Lỗi", "Mã xác thực không hợp lệ", [
        //     {
        //       text: "OK",
        //       onPress: resetState,
        //     },
        //   ]);
        // }
      } else if (credentialCardId) {
        // if (visitOfUser && !isFetchingVisit && !isLoadingVisit && !isError) {
        //   redirected.current = true;
        await new Promise((resolve) => setTimeout(resolve, 500));
        // console.log("Xe CCCDCCCD")
        // setCheckInData((prevData) => ({
        //   ...prevData,
        //   type: "CredentialCard",
        //   isVehicle: true,
        //   CredentialCard: credentialCardId,
        // }));
        // dispatch(setValidCheckIn(checkInData))
        dispatch(setCredentialCard(credentialCardId))
        dispatch(setType("CredentialCard"))
        dispatch(setIsVehicle(true))

        router.push({
          pathname: "/check-in/ListVisit",
          // params: { VerifiedId: credentialCardId, type: "CredentialCard", isVehicle: "true" },
        });
        // router.push({
        //   pathname: "/check-in/ListVisitLicensePlate",
        //   params: { credentialCardId },
        // });
        resetState();
        qrLock.current = true;
        // setIsCameraActive(false);
        // } else if (
        //   !isLoadingVisit &&
        //   !isFetchingVisit &&
        //   !visitNotFoundShown.current
        // ) {
        //   visitNotFoundShown.current = true;
        //   handleVisitNotFound();
        // }
      }
    };

    handleLicenseScan();
  }, [
    scanType,
    scannedData,
    // visitOfUser,
    // isLoadingVisit,
    // isFetchingVisit,
    // qrCardData,
    // isLoadingQr,
    // isFetchingQr,
    cardVerification,
    credentialCardId,
  ]);

  const handleLicensePlateScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      setScannedData(data);
      setScanType("license");
      console.log("License Plate Scanned Data:", data);
      // qrLock.current = true;
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      setScannedData(data);
      setScanType("normal");
      console.log("Normal QR Scanned Data:", data);
      qrLock.current = true;
    }
  };

  const handleGoBack = () => {
    resetState();
    router.back();
  };

  const handleGoToScanQr2 = () => {
    router.replace("/check-in/scanQr2");
  };

  return (
    <View className="flex-1 bg-black justify-center items-center">
      {isCameraReady && isCameraInitialized && (
        <>
          <View style={{ flex: 1, width: "100%", height: "100%" }}>
            {isCameraActive && (
              <CameraView
                style={styles.camera}
                onBarcodeScanned={
                  activeCamera === "QR"
                    ? handleBarCodeScanned
                    : handleLicensePlateScanned
                }
              />
            )}
          </View>
        </>
      )}
      <Overlay />

      <View className="absolute top-14 left-4 bg-white px-3 py-2 rounded-md shadow-lg">
        <Text className="text-green-700 text-sm font-semibold">
          {activeCamera === "QR"
            ? "Quét mã QR"
            : activeCamera === "LICENSE"
              ? "Quét mã QR với xe"
              : "Quét CCCD"}
        </Text>
      </View>

      <TouchableOpacity
        className="absolute top-14 right-4 bg-black bg-opacity-50 px-3 py-3 rounded"
        onPress={handleGoBack}
      >
        <Text className="text-white">Thoát Camera</Text>
      </TouchableOpacity>

      <View className="absolute bottom-20 flex-row justify-center space-x-4 w-full px-4">
        <TouchableOpacity
          className={`flex-1 py-3 px-4 rounded-lg ${activeCamera === "QR" ? "bg-blue-500" : "bg-gray-500"
            }`}
          onPress={() => {
            setActiveCamera("QR");
            setScanType("normal");
          }}
        >
          <View className="flex-row justify-center items-center space-x-2">
            <Ionicons name="qr-code" size={24} color="white" />
            <Text className="text-white font-semibold">Quét QR</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 px-4 rounded-lg ${activeCamera === "LICENSE" ? "bg-blue-500" : "bg-gray-500"
            }`}
          onPress={() => {
            setActiveCamera("LICENSE");
            setScanType("license");
          }}
        >
          <View className="flex-row justify-center items-center space-x-2">
            <MaterialIcons name="directions-car" size={24} color="white" />
            <Text className="text-white font-semibold">Quét mã QR với xe</Text>
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-lg ${
                  activeCamera === "CCCD" ? "bg-blue-500" : "bg-gray-500"
                }`}
                onPress={() => setActiveCamera("CCCD")}
              >
                <View className="flex-row justify-center items-center space-x-2">
                  <AntDesign name="idcard" size={24} color="white" />
                  <Text className="text-white font-semibold">Quét CCCD</Text>
                </View>
              </TouchableOpacity> */}
      </View>

      <View className="absolute bottom-8 w-full">
        <Text className="text-white text-center">
          {activeCamera === "QR"
            ? "Đưa mã QR vào khung hình để quét"
            : activeCamera === "LICENSE"
              ? "Đưa mã QR vào khung hình để quét"
              : ""}
        </Text>
      </View>
    </View>
  );
};

export default scanQr;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  camera: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  headerContent: {
    position: "absolute",
    top: 240,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  checkInButton: {
    position: "absolute",
    bottom: 20,
    left: 95,
    transform: [{ translateX: -50 }],
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
