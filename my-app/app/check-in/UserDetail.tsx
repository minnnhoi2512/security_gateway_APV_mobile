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
import { CheckIn } from "@/Types/checkIn.type";
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

interface ImageData {
  imageType: "shoe" | "body";
  imageURL: string;
}

const UserDetail = () => {
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
  console.log("VISIT DETAIL: ", visitDetail);

  //CHECKIN DATA
  const [checkInData, setCheckInData] = useState<CheckIn>({
    visitDetailId: visitDetail ? visitDetail.visitDetailId : 0,
    securityInId: 0,
    gateInId: Number(selectedGateId) || 0,
    qrCardVerification: "",
    images: [],
  });

  const {
    data: qrCardData,
    isLoading: isLoadingQr,
    isError: isErrorQr,
  } = useGetDataByCardVerificationQuery(checkInData.qrCardVerification);
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
        securityInId: Number(userId) || 0,
      }));
    }
  }, [userId, selectedGateId]);

  useEffect(() => {
    if (visitDetail && visitDetail.length > 0) {
      const { visitDetailId } = visitDetail[0];
      setCheckInData((prevData) => ({
        ...prevData,
        visitDetailId,
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
  const takePhoto = async () => {
    setShoeDetectResult(null);
    try {
      const cameraResp = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!cameraResp.canceled && cameraResp.assets[0]) {
        const { uri } = cameraResp.assets[0];
        const fileName = uri.split("/").pop() || `body_${Date.now()}.jpg`;
        const bodyImage: ImageData = { imageType: "body", imageURL: uri };
        setImages((prevImages) => [
          ...prevImages.filter((img) => img.imageType !== "body"),
          bodyImage,
        ]);

        // Lấy kích thước ảnh để cắt phần giày
        const imageInfo = await new Promise<{ width: number; height: number }>(
          (resolve, reject) => {
            Image.getSize(
              uri,
              (width, height) => resolve({ width, height }),
              (error) => reject(error)
            );
          }
        );

        // Step 2: Cắt ảnh lấy phần giày (nửa dưới)
        const croppedImage = await manipulateAsync(
          uri,
          [
            {
              crop: {
                originX: 0,
                originY: imageInfo.height / 2, // Cắt từ nửa trở xuống
                width: imageInfo.width,
                height: imageInfo.height / 2, // lấy nửa dưới
              },
            },
          ],
          { compress: 1, format: SaveFormat.JPEG }
        );

        const shoeImage: ImageData = {
          imageType: "shoe",
          imageURL: croppedImage.uri,
        };
        setImages((prevImages) => [
          ...prevImages.filter((img) => img.imageType !== "shoe"),
          shoeImage,
        ]);
        // console.log("Cropped shoe image URL: ", croppedImage.uri);
        if (shoeImage) {
          const file = {
            uri: croppedImage.uri,
            type: "image/jpeg",
            name: fileName.replace("body", "shoe"),
          };
          const result = await shoeDetect(file);
          console.log("Shoe detection response:", result);

          if ("data" in result) {
            setShoeDetectResult(true);
            Alert.alert(
              "Thành công",
              "Kiểm tra giày đã được thực hiện thành công!"
            );
          } else if ("error" in result) {
            setShoeDetectResult(false);
            Alert.alert(
              "Thất bại",
              "Kiểm tra giày không thành công. Vui lòng chụp lại ảnh."
            );
          }
        }
      }
    } catch (error) {
      console.error("Error processing photo:", error);
      Alert.alert("Error", "Failed to process photo. Please try again.");
    }
  };

  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const uploadPhotosAndCheckIn = async () => {
    if (images.length < 2) {
      Alert.alert(
        "Lỗi",
        "Please take both shoe and body photos before checking in."
      );
      return;
    }
    setIsUploading(true);
    try {
      const uploadPromises = images.map(async (image) => {
        const { downloadUrl } = await uploadToFirebase(
          image.imageURL,
          `${image.imageType}_${Date.now()}.jpg`,
          (progress: number) => {
            console.log(`Upload of ${image.imageType} is ${progress}% done`);
          }
        );

        return { imageType: image.imageType, imageURL: downloadUrl };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const updatedCheckInData = {
        ...checkInData,
        images: uploadedImages,
      };

      console.log("Updated CheckIn Data: ", updatedCheckInData);

      const result = await checkIn(updatedCheckInData).unwrap();
      console.log("Check-in successful:", result);
      setIsUploading(false);
      Alert.alert("Thành công", "Check in thành công!", [
        {
          text: "OK",
          onPress: () => {
            router.push("/(tabs)/");
          },
        },
      ]);
    } catch (error: any) {
      setIsUploading(false);
      console.error("Upload or check-in failed:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      Alert.alert("Error", "Upload or check-in failed. Please try again.");
    }
  };

  const isCheckInEnabled = () => {
    return (
      images.length === 2 &&
      shoeDetectResult === true &&
      checkInData.qrCardVerification !== ""
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
      qrCardVerification: "",
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
        qrCardVerification: data,
      }));
      setIsCameraActive(false);
      Alert.alert(
        "Đã quét QR Code",
        "QR Code đã được quét thành công và sẽ hiển thị ảnh bên dưới"
      );
    }
  };

  // console.log("DATA CI: ", checkInData);

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
          <View className="flex-row justify-center mb-6">
            <View className="flex-1 mr-1">
              <View className="mb-6">
                <Text className="text-lg font-semibold mb-2">
                  Ảnh toàn thân
                </Text>
                {images.find((img) => img.imageType === "body") ? (
                  <TouchableOpacity
                    onPress={() =>
                      handleImagePress(
                        images.find((img) => img.imageType === "body")!.imageURL
                      )
                    }
                    className="relative"
                  >
                    <Image
                      source={{
                        uri: images.find((img) => img.imageType === "body")!
                          .imageURL,
                      }}
                      className="w-[90%] aspect-square rounded-lg"
                    />
                    <View className="absolute m-1 bottom-1 bg-black/50 px-2 py-1 rounded">
                      <Text className="text-white text-xs">Xem</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={takePhoto}
                    className="bg-backgroundApp p-3 rounded-lg active:bg-backgroundApp/80"
                  >
                    <Text className="text-white text-center font-medium">
                      Chụp ảnh toàn thân
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-lg font-semibold mb-2">Ảnh giày</Text>
              {isDetecting ? (
                <View className="flex items-center justify-center h-full">
                  <ActivityIndicator size="large" color="#6255fa" />
                </View>
              ) : isDetectError ? (
                <View className="flex items-center">
                  <Text className="text-red-600 text-center mb-2">
                    Đã có lỗi xảy ra khi phát hiện giày.
                  </Text>
                  <TouchableOpacity
                    onPress={takePhoto}
                    className="bg-backgroundApp px-4 py-2 rounded"
                  >
                    <Text className="text-white">Chụp lại</Text>
                  </TouchableOpacity>
                </View>
              ) : images.find((img) => img.imageType === "shoe") ? (
                <TouchableOpacity
                  onPress={() =>
                    handleImagePress(
                      images.find((img) => img.imageType === "shoe")!.imageURL
                    )
                  }
                  className="relative"
                >
                  <Image
                    source={{
                      uri: images.find((img) => img.imageType === "shoe")!
                        .imageURL,
                    }}
                    className="w-[90%] mt-[2px] aspect-square rounded-lg"
                  />
                  <View className="absolute bottom-8 m-1 bg-black/50 px-2 py-1 rounded">
                    <Text className="text-white text-xs">Xem</Text>
                  </View>
                  {shoeDetectResult === true ? (
                    <Text className="mt-2 text-green-600 text-center">
                      Kiểm tra thành công!
                    </Text>
                  ) : shoeDetectResult === false ? (
                    <Text className="text-red-600 text-center">
                      Kiểm tra thất bại! Chụp lại ảnh toàn thân.
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ) : (
                <Text className="text-gray-600 text-center text-sm">
                  Chưa có ảnh giày. Chụp ảnh toàn thân trước để lấy ảnh giày.
                </Text>
              )}
            </View>
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

          {/* MODAL LOADING TO CHECK IN */}
          <Modal visible={isUploading} transparent={true} animationType="fade">
            <View className="flex-1 bg-black/50 justify-center items-center">
              <View className="bg-white p-6 rounded-2xl items-center">
                <ActivityIndicator size="large" color="#6255fa" />
                <Text className="mt-4 text-lg font-medium text-gray-700">
                  Đang trong quá trình check in
                </Text>
                <Text className="mt-2 text-sm text-gray-500">
                  Vui lòng đợi trong giây lát...
                </Text>
              </View>
            </View>
          </Modal>

          {/* Check In Button */}
          <TouchableOpacity
            disabled={!isCheckInEnabled()}
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
