import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Camera, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCreateVisitorMutation } from "@/redux/services/visitor.service";
import * as FileSystem from "expo-file-system";
import { MaterialIcons } from "@expo/vector-icons";
import {
  useDetectDrivingLicenseMutation,
  useDetectIdentityCardMutation,
} from "@/redux/services/pythonApi.service";

const CreateVisitor = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const router = useRouter();

  const [createVisitor, { isLoading }] = useCreateVisitorMutation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectIdentityCard] = useDetectIdentityCardMutation();
  const [detectGPLX] = useDetectDrivingLicenseMutation();

  const [showForm, setShowForm] = useState(false);
  const [initialPhoto, setInitialPhoto] = useState<string | null>(null);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUriBack, setPhotoUriBack] = useState<string | null>(null);
  const [visitor, setVisitor] = useState<Visitor>({
    visitorName: "",
    companyName: "",
    phoneNumber: "",
    email: "",
    credentialsCard: "",
    credentialCardTypeId: 1,
    visitorCredentialFrontImageFromRequest: null,
    visitorCredentialBackImageFromRequest: null,
    visitorCredentialBlurImageFromRequest: null,
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
  const handleInputChange = (field: string, value: any) => {
    setVisitor((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const base64ToFile = async (base64String: string) => {
    try {
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
      const fileUri = FileSystem.documentDirectory + `temp_${Date.now()}.jpg`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return fileUri;
    } catch (error) {
      console.error("Lỗi khi chuyển đổi base64 sang file:", error);
      throw error;
    }
  };

  const takeInitialPhoto = async () => {
    try {
      const cameraResp = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!cameraResp.canceled && cameraResp.assets[0]) {
        const { uri } = cameraResp.assets[0];
        const fileName = uri.split("/").pop();
        setIsProcessing(true);

        const formData = new FormData();
        const fileToUpload = {
          uri,
          type: "image/jpeg",
          name: fileName ?? "image.jpg",
        };
        formData.append("file", fileToUpload as any);

        setInitialPhoto(uri);
        setPhotoUri(uri);

        try {
          // setVisitor((prev) => ({
          //   ...prev,
          //   credentialCardTypeId: 1,
          // }));
          const result = await detectIdentityCard(formData).unwrap();
          // console.log("Response from API:", result);
          // const { id, name, birth, imgblur } = result.data;
          if (!result.birth.toString().includes("/")) {
            setVisitor((prev) => ({
              ...prev,
              visitorName: "",
              companyName: "",
              phoneNumber: "",
              email: "",
              credentialsCard: "",
              imgBlur: null,
              visitorCredentialFrontImageFromRequest: null,
              visitorCredentialBackImageFromRequest: null,
            }));
            alert(
              "Hệ thống không nhận diện được ảnh\nVui lòng chọn đúng loại giấy tờ."
            );
            return;
          } else {
            const blurImageUri = await base64ToFile(result.imgblur);

            setVisitor((prev) => ({
              ...prev,
              credentialsCard: result.id || "",
              visitorName: result.name || "",
              credentialCardTypeId: 1,
              visitorCredentialFrontImageFromRequest: uri,
              visitorCredentialBlurImageFromRequest: blurImageUri,
            }));
          }
          // console.log("rs: ", result.birth);

          // if (result && result.imgblur) {
          //   const blurImageUri = await base64ToFile(result.imgblur);

          //   setVisitor((prev) => ({
          //     ...prev,
          //     credentialsCard: result.id || "",
          //     visitorName: result.name || "",
          //     credentialCardTypeId: 1,
          //     visitorCredentialFrontImageFromRequest: uri,
          //     visitorCredentialBlurImageFromRequest: blurImageUri,
          //   }));
          // } else {
          //   throw new Error("Dữ liệu phản hồi không hợp lệ");
          // }

          setIsProcessing(false);
        } catch (error: any) {
          // console.error("API Error:", JSON.stringify(error, null, 2));
          let errorMessage = "Không xử lý được thẻ căn cước. Vui lòng thử lại.";

          // if (error.data) {
          //   errorMessage = error.data;
          // }

          Alert.alert("Lỗi", errorMessage);
          setIsProcessing(false);
          setInitialPhoto(null);
        }
      }
    } catch (error) {
      // console.error("Error taking photo:", JSON.stringify(error, null, 2));
      Alert.alert("Lỗi", "Không thể nhận diện ảnh. Vui lòng thử lại.");
      setIsProcessing(false);
      setInitialPhoto(null);
    }
  };
  const takeInitialPhotoGPLX = async () => {
    try {
      const cameraResp = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!cameraResp.canceled && cameraResp.assets[0]) {
        const { uri } = cameraResp.assets[0];
        const fileName = uri.split("/").pop();
        setIsProcessing(true);

        const formData = new FormData();
        const fileToUpload = {
          uri,
          type: "image/jpeg",
          name: fileName ?? "image.jpg",
        };
        formData.append("file", fileToUpload as any);

        setInitialPhoto(uri);
        setPhotoUri(uri);

        try {
          // setVisitor((prev) => ({
          //   ...prev,
          //   credentialCardTypeId: 1,
          // }));
          const result = await detectGPLX(formData).unwrap();
          // console.log("Response from API:", result);

          if (result && result.imgblur) {
            const blurImageUri = await base64ToFile(result.imgblur);

            setVisitor((prev) => ({
              ...prev,
              credentialsCard: result.id || "",
              visitorName: result.name || "",
              credentialCardTypeId: 2,
              visitorCredentialFrontImageFromRequest: uri,
              visitorCredentialBlurImageFromRequest: blurImageUri,
            }));
          } else {
            // throw new Error("Invalid response data");
          }

          setIsProcessing(false);
        } catch (error: any) {
          // console.error("API Error:", JSON.stringify(error, null, 2));
          let errorMessage = "Không thể nhận diện ảnh. Vui lòng thử lại";

          // if (error.data) {
          //   errorMessage = error.data;
          // }

          Alert.alert("Lỗi", errorMessage);
          setIsProcessing(false);
          setInitialPhoto(null);
        }
      }
    } catch (error) {
      // console.error("Error taking photo:", JSON.stringify(error, null, 2));
      Alert.alert("Lỗi", "Không thể nhận diện ảnh. Vui lòng thử lại.");
      setIsProcessing(false);
      setInitialPhoto(null);
    }
  };
  const handleConfirmInitialPhoto = () => {
    setShowForm(true);
  };

  const takePhotoBack = async () => {
    try {
      const cameraResp = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (!cameraResp.canceled && cameraResp.assets[0]) {
        const { uri } = cameraResp.assets[0];
        setPhotoUriBack(uri);

        setVisitor((prev) => ({
          ...prev,
          visitorCredentialBackImageFromRequest: uri,
        }));
      }
    } catch (error) {
      console.error("Lỗi khi chụp ảnh:", error);
      Alert.alert("Lỗi", "Không chụp được ảnh. Vui lòng thử lại.");
    }
  };

  const validateForm = () => {
    const {
      visitorName,
      companyName,
      phoneNumber,
      email,
      visitorCredentialFrontImageFromRequest,
      visitorCredentialBackImageFromRequest,
    } = visitor;
    if (!visitorName) {
      Alert.alert("Lỗi xác thực", "Vui lòng cung cấp tên của khách truy cập.");
      return false;
    }
    if (!phoneNumber) {
      Alert.alert("Lỗi xác thực", "Vui lòng cung cấp số điện thoại.");
      return false;
    }
    if (!email) {
      Alert.alert("Lỗi xác thực", "Vui lòng cung cấp email.");
      return false;
    }
    if (!companyName) {
      Alert.alert("Lỗi xác thực", "Vui lòng cung cấp tên công ty.");
      return false;
    }
    if (!visitorCredentialFrontImageFromRequest) {
      Alert.alert("Lỗi xác thực", "Vui lòng chụp ảnh CMND.");
      return false;
    }
    if (!visitorCredentialBackImageFromRequest) {
      Alert.alert(
        "Lỗi xác thực",
        "Vui lòng chụp ảnh mặt sau của thẻ căn cước."
      );
      return false;
    }

    return true;
  };
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    const formData = new FormData();
    formData.append("visitorName", visitor.visitorName);
    formData.append("companyName", visitor.companyName);
    formData.append("phoneNumber", visitor.phoneNumber);
    formData.append("email", visitor.email);
    formData.append("credentialsCard", visitor.credentialsCard);
    formData.append(
      "credentialCardTypeId",
      visitor.credentialCardTypeId.toString()
    );

    if (visitor.visitorCredentialFrontImageFromRequest) {
      const frontFileName =
        visitor.visitorCredentialFrontImageFromRequest.split("/").pop() ||
        "front.jpg";
      console.log(visitor.visitorCredentialFrontImageFromRequest);
      formData.append("visitorCredentialFrontImageFromRequest", {
        uri: visitor.visitorCredentialFrontImageFromRequest,
        type: "image/jpeg",
        name: frontFileName,
      } as any);
    }

    if (visitor.visitorCredentialBackImageFromRequest) {
      const backFileName =
        visitor.visitorCredentialBackImageFromRequest.split("/").pop() ||
        "back.jpg";
      formData.append("visitorCredentialBackImageFromRequest", {
        uri: visitor.visitorCredentialBackImageFromRequest,
        type: "image/jpeg",
        name: backFileName,
      } as any);
    }

    if (visitor.visitorCredentialBlurImageFromRequest) {
      const blurFileName =
        visitor.visitorCredentialBlurImageFromRequest.split("/").pop() ||
        "blur.jpg";
      formData.append("visitorCredentialBlurImageFromRequest", {
        uri: visitor.visitorCredentialBlurImageFromRequest,
        type: "image/jpeg",
        name: blurFileName,
      } as any);
    }

    try {
      const response = await createVisitor(formData).unwrap();
      Alert.alert("Thành công", "Tạo khách vãng lai thành công", [
        {
          text: "OK",
          onPress: () => {
            router.push("/(tabs)");
          },
        },
      ]);
    } catch (error: any) {
      console.log("Tạo chi tiết lỗi của khách truy cập:", error?.data?.errors);

      const errors = error?.data?.errors;
      if (errors && typeof errors === "object") {
        let errorMessage = "Lỗi khi tạo khách:\n";
        Object.entries(errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            errorMessage += `${field}: ${messages.join(", ")}\n`;
          } else if (messages) {
            errorMessage += `${field}: ${messages}\n`;
          }
        });
        Alert.alert("Lỗi", errorMessage);
      } else {
        Alert.alert("Lỗi", "Không tạo được khách truy cập. Vui lòng thử lại.");
      }
    }
  };
  const handleGoBack = () => {
    if (showForm) {
      setShowForm(false);
      setInitialPhoto(null);
    } else {
      router.back();
    }
  };

  const capitalizeWords = (str: string | undefined): string => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // console.log("Create visitor data: ", visitor);
  if (!showForm) {
    return (
      <View className="flex-1 bg-gradient-to-b from-blue-50 to-white mt-[53px] p-6">
        <Pressable
          onPress={handleGoBack}
          className="flex flex-row items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg active:bg-gray-200 mb-6"
        >
          <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
          <Text className="text-gray-600 font-medium">Quay về</Text>
        </Pressable>

        <View className="flex-1 justify-center items-center">
          {!initialPhoto ? (
            <View className="flex-row space-x-4 p-4 mb-16">
              <TouchableOpacity
                onPress={takeInitialPhoto}
                className="flex-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <View className="items-center">
                  <View className="bg-blue-500 p-4 rounded-full mb-4">
                    <MaterialIcons name="credit-card" size={32} color="white" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800 mb-2">
                    CCCD
                  </Text>
                  <Text className="text-sm text-gray-500 text-center mb-4">
                    Chụp ảnh căn cước công dân
                  </Text>
                  <View className="flex-row items-center bg-blue-50 px-4 py-2 rounded-full">
                    <MaterialIcons
                      name="camera-alt"
                      size={20}
                      color="#2563eb"
                    />
                    <Text className="ml-2 text-blue-600 font-medium">
                      Chụp ảnh
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takeInitialPhotoGPLX}
                className="flex-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <View className="items-center">
                  <View className="bg-orange-500 p-4 rounded-full mb-4">
                    <MaterialIcons
                      name="directions-car"
                      size={32}
                      color="white"
                    />
                  </View>
                  <Text className="text-lg font-bold text-gray-800 mb-2">
                    GPLX
                  </Text>
                  <Text className="text-sm text-gray-500 text-center mb-4">
                    Chụp ảnh giấy phép lái xe
                  </Text>
                  <View className="flex-row items-center bg-orange-50 px-4 py-2 rounded-full">
                    <MaterialIcons
                      name="camera-alt"
                      size={20}
                      color="#f97316"
                    />
                    <Text className="ml-2 text-orange-600 font-medium">
                      Chụp ảnh
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            // <View className="w-full items-center">
            //   <Image
            //     source={{ uri: initialPhoto }}
            //     style={{ width: "100%", height: 300 }}
            //     className="rounded-lg mb-4"
            //   />
            //   <View className="flex-row space-x-4">
            //     <TouchableOpacity
            //       onPress={handleConfirmInitialPhoto}
            //       disabled={isProcessing}
            //       className="bg-buttonGreen p-3 rounded-lg flex-1"
            //     >
            //       <Text className="text-white text-center">
            //         {isProcessing ? "Đang xử lý..." : "Xác nhận"}
            //       </Text>
            //     </TouchableOpacity>
            //   </View>
            // </View>
            <View className="w-full items-center">
              {initialPhoto && (
                <Image
                  source={{ uri: initialPhoto }}
                  style={{ width: "100%", height: 300 }}
                  className="rounded-lg mb-4"
                />
              )}

              {isProcessing ? (
                <View className="w-full bg-white p-4 rounded-lg mb-4">
                  <ActivityIndicator size="small" color="#34495e" />
                  <Text className="text-center text-backgroundApp mt-2">
                    Đang xử lý...
                  </Text>
                </View>
              ) : visitor.credentialsCard && visitor.visitorName ? (
                <View className="w-full bg-white p-4 rounded-lg mb-4">
                  <View className="mb-2">
                    <Text className="text-sm text-gray-500 mb-1">
                      Họ và tên:
                    </Text>
                    <Text className="text-base font-medium">
                      {capitalizeWords(visitor.visitorName)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm text-gray-500 mb-1">
                      {visitor.credentialCardTypeId === 1
                        ? "Số CCCD:"
                        : "Số GPLX:"}
                    </Text>
                    <Text className="text-base font-medium">
                      {visitor.credentialsCard}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View className="flex-row space-x-4 w-full">
                <TouchableOpacity
                  onPress={() => {
                    setInitialPhoto(null);
                    setVisitor((prev) => ({
                      ...prev,
                      credentialsCard: "",
                      visitorName: "",
                      visitorCredentialFrontImageFromRequest: null,
                      visitorCredentialBlurImageFromRequest: null,
                    }));
                  }}
                  className="bg-gray-500 p-3 rounded-lg flex-1"
                >
                  <Text className="text-white text-center">Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmInitialPhoto}
                  disabled={
                    isProcessing ||
                    !visitor.credentialsCard ||
                    !visitor.visitorName
                  }
                  className={`bg-buttonGreen p-3 rounded-lg flex-1 ${
                    isProcessing ||
                    !visitor.credentialsCard ||
                    !visitor.visitorName
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  <Text className="text-white text-center">
                    {isProcessing ? "Đang xử lý..." : "Xác nhận"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-blue-50 to-white mt-[53px]">
      <View>
        <Pressable
          onPress={handleGoBack}
          className="flex flex-row items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg active:bg-gray-200"
        >
          <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
          <Text className="text-gray-600 font-medium">Quay về</Text>
        </Pressable>
      </View>
      <View className="p-6">
        <Text className="text-3xl font-bold mb-6 text-backgroundApp text-center">
          Tạo khách đến thăm
        </Text>
        <View className="bg-backgroundApp rounded-xl shadow-lg p-6 mb-6">
          <View className="mb-4">
            <Text className="text-sm font-semibold text-white mb-2">
              Số CCCD/GPLX
            </Text>
            <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <Text className="text-backgroundApp">
                {visitor?.credentialsCard || ""}
              </Text>
            </View>
          </View>
          {/* <View className="mb-4">
            <Text className="text-sm font-semibold text-white mb-2">
              Tên khách hàng
            </Text>
            <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <Text className="text-backgroundApp">
                {visitor?.visitorName || ""}
              </Text>
            </View>
          </View> */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-white mb-2">
              Tên khách hàng
            </Text>
            <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <Text className="text-backgroundApp">
                {capitalizeWords(visitor?.visitorName) || ""}
              </Text>
            </View>
          </View>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-white mb-2">
              Số điện thoại
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-backgroundApp"
              value={visitor.phoneNumber}
              onChangeText={(text) => handleInputChange("phoneNumber", text)}
              placeholder="Nhập số điện thoại"
            />
          </View>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-white mb-2">Email</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-backgroundApp"
              value={visitor.email}
              onChangeText={(text) => handleInputChange("email", text)}
              placeholder="Nhập email"
            />
          </View>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-white mb-2">
              Tên công ty
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-backgroundApp"
              value={visitor.companyName}
              onChangeText={(text) => handleInputChange("companyName", text)}
              placeholder="Nhập tên công ty"
            />
          </View>

          {photoUri && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-white mb-2">
                Ảnh mặt trước
              </Text>
              <Image
                source={{ uri: photoUri }}
                style={{ width: "100%", height: 220 }}
                className="rounded-lg"
              />
            </View>
          )}

          <View className="mb-4">
            <TouchableOpacity
              onPress={takePhotoBack}
              className="bg-buttonGreen p-3 rounded-lg"
            >
              <Text className="text-white text-center">Chụp ảnh mặt sau</Text>
            </TouchableOpacity>
          </View>

          {photoUriBack && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-white mb-2">
                Ảnh mặt sau
              </Text>
              <Image
                source={{ uri: photoUriBack }}
                style={{ width: "100%", height: 220 }}
                className="rounded-lg"
              />
            </View>
          )}

          <TouchableOpacity
            className={`bg-buttonGreen rounded-lg py-4 px-6 shadow-md ${
              isLoading ? "opacity-50" : ""
            }`}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-bold text-lg">
              {isLoading ? "Đang xử lý..." : "Tạo mới"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};
export default CreateVisitor;
