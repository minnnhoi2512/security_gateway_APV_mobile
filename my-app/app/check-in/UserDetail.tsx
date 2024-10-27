import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  Button,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import {
  GestureHandlerRootView,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import { uploadToFirebase } from "../../firebase-config";
import { CheckIn, CheckInVer02 } from "@/Types/checkIn.type";
import { useGetVisitDetailByIdQuery } from "@/redux/services/visit.service";
import {
  useGetDataByCardVerificationQuery,
  useShoeDetectMutation,
} from "@/redux/services/qrcode.service";
import { useCheckInMutation } from "@/redux/services/checkin.service";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RNPicker from "@react-native-picker/picker";
import { VisitDetailType } from "@/redux/Types/visit.type";
import { captureRef } from "react-native-view-shot";
interface ImageData {
  imageType: "Shoe";
  imageFile: string;
}

const UserDetail = () => {
  const videoRef = useRef<Video>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const { visitId } = useLocalSearchParams<{ visitId: string }>();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const qrLock = useRef(false);
  const [userId, setUserId] = useState<string | null>(null);
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // const screenWidth = Dimensions.get("window").width;
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
 

  // RTK QUERY
  const [
    shoeDetect,
    { isLoading: isDetecting, isError: isDetectError, data: detectData },
  ] = useShoeDetectMutation();

  const {
    data: visitDetail,
    isLoading,
    isError,
  } = useGetVisitDetailByIdQuery(visitId);

  //CHECKIN DATA
  const [checkInData, setCheckInData] = useState<CheckInVer02>({
    VisitDetailId: visitDetail ? visitDetail.visitDetailId : 0,
    SecurityInId: 0,
    GateInId: Number(selectedGateId) || 0,
    QrCardVerification: "",
    Images: [],
  });

  const {
    data: qrCardData,
    isLoading: isLoadingQr,
    isError: isErrorQr,
  } = useGetDataByCardVerificationQuery(checkInData.QrCardVerification);
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();

  const [shoeDetectResult, setShoeDetectResult] = useState<boolean | null>(
    null
  );
  const [securityConfirmation, setSecurityConfirmation] = useState<string>("");

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
      setCheckInData((prevState) => ({
        ...prevState,
        SecurityInId: Number(userId) || 0,
      }));
    }
  }, [userId, selectedGateId]);

  useEffect(() => {
    if (visitDetail && visitDetail.length > 0) {
      const { visitDetailId } = visitDetail[0];
      setCheckInData((prevData) => ({
        ...prevData,
        VisitDetailId: visitDetailId,
      }));
    }
  }, [visitDetail]);

  //PERMISSION
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
  //PERMISSION
  const handleGoBack = () => {
    router.back();
  };


  // const captureImage = async () => {
  //   try {
 
  //     const uri = await captureRef(videoRef, {
  //       format: "jpg",
  //       quality: 0.8,
  //     });

  //     const shoeImage: ImageData = {
  //       imageType: "Shoe",
  //       imageFile: uri,
  //     };

  //     setImages((prevImages) => [
  //       ...prevImages.filter((img) => img.imageType !== "Shoe"),
  //       shoeImage,
  //     ]);

  //     console.log("Captured image URI:", shoeImage);
  //   } catch (error) {
  //     console.error("Failed to capture image:", error);
  //   }
  // };

  const captureImage = async () => {
    if (videoRef.current) {
      try {
        // Pause the video to capture the current frame
        await videoRef.current.pauseAsync();
        
        // Get the video frame using a suitable method; this is a placeholder
        const snapshot = await videoRef.current.getStatusAsync();
  
        // Assuming you have a method to extract a frame, for example, using `captureRef`
        const frameUri = await captureRef(videoRef.current, {
          format: 'png',
          quality: 0.8,
        });
  
        // Save the captured frame to the file system
        const savedFileUri = `${FileSystem.documentDirectory}captured_image.png`;
        
        // You can use FileSystem.copyAsync to save the image if necessary
        await FileSystem.copyAsync({
          from: frameUri,
          to: savedFileUri,
        });
  
        const shoeImage: ImageData = {
          imageType: 'Shoe',
          imageFile: savedFileUri,
        };
  
        // Update the images state
        setImages((prevImages) => [
          ...prevImages.filter((img) => img.imageType !== 'Shoe'),
          shoeImage,
        ]);
  
        setCapturedImage(savedFileUri);
        console.log("Captured image URI:", savedFileUri);
      } catch (error) {
        console.error("Capture Error:", error);
      }
    }
  };

  
  //   try {
  //     await playVideo(); // Ensure video is playing
  //     setTimeout(async () => {
  //       const uri = await captureRef(videoRef, {
  //         format: "jpg",
  //         quality: 0.8,
  //       });
  
  //       const shoeImage: ImageData = {
  //         imageType: "Shoe",
  //         imageFile: uri,
  //       };
  
  //       setImages((prevImages) => [
  //         ...prevImages.filter((img) => img.imageType !== "Shoe"),
  //         shoeImage,
  //       ]);
  
  //       console.log("Captured image URI:", shoeImage);
  //     }, 1000); // Delay for 1 second
  //   } catch (error) {
  //     console.error("Failed to capture image:", error);
  //   }
  // };
  

  const playVideo = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      } catch (error) {
        console.error("Play Video Error:", error);
      }
    }
  };

  const uploadPhotosAndCheckIn = async () => {
    // if (images.length < 1) {
    //   Alert.alert("Error", "Please take both full-body and shoe photos.");
    //   return;
    // }

    // setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("VisitDetailId", checkInData.VisitDetailId.toString());
      formData.append("SecurityInId", checkInData.SecurityInId.toString());
      formData.append("GateInId", checkInData.GateInId.toString());
      formData.append("QrCardVerification", checkInData.QrCardVerification);

      for (const image of images) {
        // Upload the image to Firebase and get the download URL
        const { downloadUrl } = await uploadToFirebase(
          image.imageFile,
          `${image.imageType}_${Date.now()}.jpg`
        );

        // Extract the filename and type
        const localUri = image.imageFile;
        const filename = localUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : `image`;

        // Append fields for this image to formData
        formData.append(
          `Images[${images.indexOf(image)}].ImageType`,
          image.imageType
        );
        formData.append(
          `Images[${images.indexOf(image)}].ImageURL`,
          downloadUrl.replace(/"/g, "")
        );
        formData.append(`Images[${images.indexOf(image)}].Image`, {
          uri: localUri,
          name: filename,
          type,
        } as any);
      }

      console.log("FORM DATA: ", formData);

      const result = await checkIn(formData).unwrap();
      Alert.alert("Success", "Check-in was successful!");
      router.push("/(tabs)/");
    } catch (error) {
      console.error("Error during check-in process:", error);
      Alert.alert("Error", "Check-in failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  const isCheckInEnabled = () => {
    return (
      images.length === 2 && checkInData.QrCardVerification !== ""
      // &&
      // securityConfirmation === "correct"
    );
  };

  const resetQrScanning = () => {
    qrLock.current = false;
    setIsCameraActive(false);
    setQrImage(null);
    setCheckInData((prev) => ({
      ...prev,
      QrCardVerification: "",
    }));
  };

  useEffect(() => {
    if (qrCardData?.cardImage) {
      setQrImage(`data:image/png;base64,${qrCardData.cardImage}`);
    }
  }, [qrCardData]);

  //SCAN QR CERTIFICATION
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      qrLock.current = true;
      console.log("Scanned QR Code Data:", data);

      setCheckInData((prevData) => ({
        ...prevData,
        QrCardVerification: data,
      }));
      setIsCameraActive(false);
      Alert.alert(
        "Đã quét QR Code",
        "QR Code đã được quét thành công và sẽ hiển thị ảnh bên dưới"
      );
    }
  };

  console.log("DATA CI: ", checkInData);

  //PERMISSION VIEW
  if (!isPermissionGranted) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-800 mb-4">Permission not granted</Text>
        <Button title="Request permission" onPress={requestPermission}></Button>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-xl font-semibold text-backgroundApp">
          Loading...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-xl font-semibold text-red-500">
          Error fetching visit details.
        </Text>
      </View>
    );
  }

  // console.log("check data: ", checkInData);

  return (
    <SafeAreaView className="flex-1 bg-gray-100 mb-4">
      <View>
        <Pressable
          onPress={handleGoBack}
          className="flex flex-row items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg active:bg-gray-200"
        >
          <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
          <Text className="text-gray-600 font-medium">Quay về</Text>
        </Pressable>
      </View>

      <ScrollView>
        <GestureHandlerRootView className="flex-1 p-5">
          <View className="bg-backgroundApp rounded-3xl p-6 mb-6 shadow-lg">
            {visitDetail && visitDetail.length > 0 ? (
              visitDetail.map((visit: VisitDetailType, index: number) => (
                <View key={index} className="space-y-4">
                  <View className="flex-row items-center space-x-3">
                    <FontAwesome5 name="user" size={24} color="#fff" />
                    <Text className="text-lg text-white">
                      Người tham gia: {visit.visitor?.visitorName || "N/A"}
                    </Text>
                  </View>
                  <View className="flex-row items-center space-x-3">
                    <FontAwesome5 name="phone" size={24} color="#fff" />
                    <Text className="text-lg text-white">
                      Số điện thoại: {visit.visitor?.phoneNumber || "N/A"}
                    </Text>
                  </View>
                  <View className="flex-row items-center space-x-3">
                    <FontAwesome5 name="building" size={24} color="#fff" />
                    <Text className="text-lg text-white">
                      Công ty: {visit.visitor?.companyName || "N/A"}
                    </Text>
                  </View>
                  <View className="flex-row items-center space-x-3">
                    <MaterialIcons name="access-time" size={24} color="#fff" />
                    <Text className="text-lg text-white">
                      Bắt đầu: {visit.expectedStartHour || "N/A"}
                    </Text>
                  </View>
                  <View className="flex-row items-center space-x-3">
                    <MaterialIcons name="access-time" size={24} color="#fff" />
                    <Text className="text-lg text-white">
                      Kết thúc: {visit.expectedEndHour || "N/A"}
                    </Text>
                  </View>

                  <View className="flex items-center space-x-3 mb-2">
                    <Text className="text-lg text-white">CCCD:</Text>
                  </View>
                  <Image
                    src={`data:image/;base64,${visit.visitor.visitorCredentialImage}`}
                    className="w-full h-48 rounded-lg object-contain"
                    alt="CCCD"
                  />
                </View>
              ))
            ) : (
              <Text className="text-lg text-white">
                No visit details available.
              </Text>
            )}
          </View>

          {/* Photo Section */}
          <Text className="text-xl font-bold text-gray-800 mb-4">Chụp ảnh</Text>
          <View>
            <Text>Streaming</Text>
            <Video
              ref={videoRef}
              source={{
                uri: "https://security-gateway-camera.tools.kozow.com/index.m3u8",
              }}
              style={{ width: "100%", height: 300 }}
              onError={(e) => console.log("Video Error:", e)}
              shouldPlay={true}
            />
            {isPlaying && (
              <Button title="Capture Image" onPress={captureImage} />
            )}
            {!isPlaying && <Button title="Play Video" onPress={playVideo} />}

            {/* Show Captured Image */}
            {capturedImage && (
              <Image
                source={{ uri: capturedImage }}
                style={{ width: "100%", height: 300, marginTop: 10 }}
              />
            )}

            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img.imageFile }}
                className="w-[150px] h-[150px]"
              />
            ))}
          </View>

          {/* MODAL VIEW IMAGE */}
          <Modal
            visible={!!selectedImage}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setSelectedImage(null)}
          >
            <View className="flex-1 bg-black/90 justify-center items-center">
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-96"
                  resizeMode="contain"
                />
              )}
              <TouchableOpacity
                className="m-1 bg-white p-y-2 p-x-1 rounded-md"
                onPress={() => setSelectedImage(null)}
              >
                <Text className="text-red text-xl font-bold">✕</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          {/* QR Scanner */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Hình ảnh QR Code
            </Text>

            {isCameraActive ? (
              <View className="w-full aspect-[3/4] relative mb-4">
                <CameraView
                  onBarcodeScanned={handleBarCodeScanned}
                  className="flex-1"
                />
                <View className="absolute top-[30%] left-[30%] w-[40%] h-[30%] border-2 border-yellow-400 rounded-lg" />
                <TouchableOpacity
                  onPress={() => setIsCameraActive(false)}
                  className="absolute top-2 right-2 bg-black/50 p-2 rounded"
                >
                  <Text className="text-white">Thoát Camera</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {qrImage ? (
                  <View className="mb-4">
                    <Image
                      source={{ uri: qrImage }}
                      className="w-full h-48 rounded-lg"
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      onPress={resetQrScanning}
                      className="mt-2 bg-backgroundApp p-3 rounded-lg"
                    >
                      <Text className="text-white text-center">
                        Quét lại QR Code
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setIsCameraActive(true)}
                    className="bg-backgroundApp p-4 rounded-lg active:bg-backgroundApp/80"
                  >
                    <Text className="text-white text-center text-lg font-medium">
                      Quét QR Code
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>


          {/* Check In Button */}
          <TouchableOpacity
            // disabled={!isCheckInEnabled()}
            onPress={uploadPhotosAndCheckIn}
            className={`p-4 rounded-lg ${
              isCheckInEnabled()
                ? "bg-backgroundApp active:bg-backgroundApp/80"
                : "bg-gray-400"
            }`}
          >
            <Text className="text-white text-center text-lg font-medium">
              Check In
            </Text>
          </TouchableOpacity>
        </GestureHandlerRootView>
      </ScrollView>
    </SafeAreaView>
  );
};
export default UserDetail;
