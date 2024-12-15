import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Camera, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCreateVisitorMutation } from "@/redux/services/visitor.service";
import * as FileSystem from "expo-file-system";
import { MaterialIcons } from "@expo/vector-icons";
import { useDetectIdentityCardMutation } from "@/redux/services/pythonApi.service";

const CreateVisitor = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const router = useRouter();

  const [createVisitor, { isLoading }] = useCreateVisitorMutation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectIdentityCard] = useDetectIdentityCardMutation();

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
      console.error("Error converting base64 to file:", error);
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
          const result = await detectIdentityCard(formData).unwrap();
          console.log("Response from API:", result);

          if (result && result.imgblur) {
            const blurImageUri = await base64ToFile(result.imgblur);

            setVisitor((prev) => ({
              ...prev,
              credentialsCard: result.id || "",
              visitorName: result.name || "",
              visitorCredentialFrontImageFromRequest: uri,
              visitorCredentialBlurImageFromRequest: blurImageUri,
            }));
          } else {
            throw new Error("Invalid response data");
          }

          setIsProcessing(false);
        } catch (error: any) {
          console.error("API Error:", JSON.stringify(error, null, 2));
          let errorMessage =
            "Failed to process identity card. Please try again.";

          if (error.data) {
            errorMessage = error.data;
          }

          Alert.alert("Error", errorMessage);
          setIsProcessing(false);
          setInitialPhoto(null);
        }
      }
    } catch (error) {
      console.error("Error taking photo:", JSON.stringify(error, null, 2));
      Alert.alert("Error", "Failed to take photo. Please try again.");
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
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
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
      Alert.alert("Validation Error", "Please provide the visitor's name.");
      return false;
    }
    if (!phoneNumber) {
      Alert.alert("Validation Error", "Please provide a phone number.");
      return false;
    }
    if (!email) {
      Alert.alert("Validation Error", "Please provide a email.");
      return false;
    }
    if (!companyName) {
      Alert.alert("Validation Error", "Please provide a company name.");
      return false;
    }
    if (!visitorCredentialFrontImageFromRequest) {
      Alert.alert("Validation Error", "Please take a photo of the ID card.");
      return false;
    }
    if (!visitorCredentialBackImageFromRequest) {
      Alert.alert(
        "Validation Error",
        "Please take a photo of the back of the ID card."
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
      console.log("FormData being sent:", formData);
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
      console.log("Create visitor error details:", error?.data?.errors);

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
        Alert.alert("Error", errorMessage);
      } else {
        Alert.alert("Error", "Failed to create visitor. Please try again.");
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
            <TouchableOpacity
              onPress={takeInitialPhoto}
              className="bg-buttonGreen p-6 rounded-lg shadow-lg"
            >
              <MaterialIcons name="camera-alt" size={48} color="white" />
              <Text className="text-white text-center mt-2 font-bold">
                Chụp ảnh CCCD
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="w-full items-center">
              <Image
                source={{ uri: initialPhoto }}
                style={{ width: "100%", height: 300 }}
                className="rounded-lg mb-4"
              />
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={takeInitialPhoto}
                  className="bg-gray-500 p-3 rounded-lg flex-1"
                >
                  <Text className="text-white text-center">Chụp lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirmInitialPhoto}
                  disabled={isProcessing}
                  className="bg-buttonGreen p-3 rounded-lg flex-1"
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
            <Text className="text-sm font-semibold text-white mb-2">CCCD</Text>
            <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <Text className="text-backgroundApp">
                {visitor?.credentialsCard || ""}
              </Text>
            </View>
          </View>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-white mb-2">
              Tên khách hàng
            </Text>
            <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <Text className="text-backgroundApp">
                {visitor?.visitorName || ""}
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
                Ảnh mặt trước CCCD
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
              <Text className="text-white text-center">
                Chụp ảnh mặt sau CCCD
              </Text>
            </TouchableOpacity>
          </View>

          {photoUriBack && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-white mb-2">
                Ảnh mặt sau CCCD
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
