import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Camera, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { useCreateVisitorMutation } from "@/redux/services/visitor.service";
import { Visitor } from "@/Types/visitor.type";
interface ScanData {
  id: string;
  nationalId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  issueDate: string;
}
const CreateVisitor = () => {
  const { data } = useLocalSearchParams<{ data: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [createVisitor, { isLoading }] = useCreateVisitorMutation();
  let credentialCardId: string | null = null;
  const parseQRData = (qrData: string): ScanData => {
    const [id, nationalId, name, dateOfBirth, gender, address, issueDate] =
      qrData.split("|");
    credentialCardId = id;
    return { id, nationalId, name, dateOfBirth, gender, address, issueDate };
  };
  const userData: ScanData | null = data ? parseQRData(data) : null;
  const [visitor, setVisitor] = useState<Visitor>({
    VisitorName: userData?.name || "hieuuu",
    CompanyName: "",
    PhoneNumber: "",
    CredentialsCard: userData?.id || "0101010101",
    CredentialCardTypeId: 2,
    VisitorCredentialImageFromRequest: null,
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


  const takePhoto = async () => {
    try {
      const cameraResp = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!cameraResp.canceled && cameraResp.assets[0]) {
        const { uri } = cameraResp.assets[0];
       
        const fileName = uri.split("/").pop();
        const file = {
          uri,
          type: "image/jpeg",
          name: fileName,
        }
        handleInputChange("VisitorCredentialImageFromRequest", file);
      }
    } catch (error) {
      console.error("Error taking photo:", JSON.stringify(error, null, 2));
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
  
    // Append the fields to the FormData object
    formData.append("VisitorName", visitor.VisitorName);
    formData.append("CompanyName", visitor.CompanyName);
    formData.append("PhoneNumber", visitor.PhoneNumber);
    formData.append("CredentialsCard", visitor.CredentialsCard);
    formData.append("CredentialCardTypeId", visitor.CredentialCardTypeId.toString());
  
    // Append the image if it exists
    if (visitor.VisitorCredentialImageFromRequest) {
      formData.append(
        "VisitorCredentialImageFromRequest",
        visitor.VisitorCredentialImageFromRequest
      );
    }
  
    try {
      const response = await createVisitor(formData).unwrap();
      Alert.alert("Success", "Visitor created successfully!");
    } catch (error: any) {
      console.error("Failed to create visitor:", JSON.stringify(error, null, 2));
  
      // Extract error messages if available
      const errors = error?.data?.errors;
      if (errors) {
        let errorMessage = "Failed to create visitor due to validation errors:\n";
        Object.keys(errors).forEach((field) => {
          errorMessage += `${field}: ${errors[field].join(", ")}\n`;
        });
        Alert.alert("Error", errorMessage);
      } else {
        Alert.alert("Error", "Failed to create visitor. Please try again.");
      }
    }
  };
  
  
  console.log("Visitor: ", visitor);

  // if (!userData) {
  //   return (
  //     <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
  //       <Text className="text-xl font-bold text-gray-800">
  //         Không có dữ liệu người dùng
  //       </Text>
  //     </SafeAreaView>
  //   );
  // }

  // console.log("DATA VISITOR: ", data);

  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <View className="p-6">
        <Text className="text-3xl font-bold mb-6 text-blue-800 text-center">
          Tạo khách đến thăm
        </Text>

        <View className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              CCCD
            </Text>
            <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700" />
            <Text> {userData?.id || ""}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Tên khách hàng
            </Text>
            <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700" />
            <Text>{userData?.name || ""}</Text>
          </View>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Số điện thoại
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700"
              value={visitor.PhoneNumber}
              onChangeText={(text) => handleInputChange('PhoneNumber', text)}
              placeholder="Nhập số điện thoại"
            />
          </View>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Tên công ty
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700"
              value={visitor.CompanyName}
              onChangeText={(text) => handleInputChange('CompanyName', text)}
              placeholder="Nhập tên công ty"
            />
          </View>
          <View className="mb-4">
            <TouchableOpacity
              onPress={() => takePhoto()}
              className="bg-green-500 p-3 rounded-lg"
            >
              <Text className="text-white text-center">Chụp ảnh CCCD</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className={`bg-blue-600 rounded-lg py-4 px-6 shadow-md ${
              isLoading ? "opacity-50" : ""
            }`}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-bold text-lg">
              {isLoading ? "Creating..." : "Create Visit"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default CreateVisitor;
