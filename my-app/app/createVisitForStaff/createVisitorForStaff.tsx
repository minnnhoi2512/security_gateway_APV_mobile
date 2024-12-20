import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Image,
    SafeAreaView,
    Pressable,
  } from "react-native";
  import React, { useEffect, useState } from "react";
  import { Camera, useCameraPermissions } from "expo-camera";
  import * as ImagePicker from "expo-image-picker";
  import { useLocalSearchParams, useRouter } from "expo-router";
  import { useCreateVisitorMutation } from "@/redux/services/visitor.service";
  import { Visitor } from "@/Types/visitor.type";
  import { MaterialIcons } from "@expo/vector-icons";
import { useDetectIdentityCardMutation } from "@/redux/services/pythonApi.service";
import { useDispatch, useSelector } from "react-redux";
import VisitStaffCreate from "@/Types/VisitStaffCreate.Type";
import { setVisitStaffCreate } from "@/redux/slices/visitStaffCreate.slice";
import VisitDetailType from "@/Types/VisitDetailCreate.Type";
  interface ScanData {
    id: string;
    nationalId: string;
    name: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    issueDate: string;
  }
  const CreateVisitorForStaff = () => {
    const { data } = useLocalSearchParams<{ data: string }>();
    const [permission, requestPermission] = useCameraPermissions();
    const [isPermissionGranted, setIsPermissionGranted] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [createVisitor, { isLoading }] = useCreateVisitorMutation();
    const [detectCard] = useDetectIdentityCardMutation();
    var visitCreateData = useSelector<any>(s => s.visitStaff.data) as VisitStaffCreate
    let credentialCardId: string | null = null;
    const parseQRData = (qrData: string): ScanData => {
      const [id, nationalId, name, dateOfBirth, gender, address, issueDate] =
        qrData.split("|");
      credentialCardId = id;
      return { id, nationalId, name, dateOfBirth, gender, address, issueDate };
    };
    const userData: ScanData | null = data ? parseQRData(data) : null;
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [visitor, setVisitor] = useState<Visitor>({
      VisitorName: userData?.name || "",
      CompanyName: "",
      PhoneNumber: "",
      CredentialsCard: userData?.id || "",
      CredentialCardTypeId: 1,
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
          };
          handleInputChange("VisitorCredentialImageFromRequest", file);
          setPhotoUri(uri);
          const formData = new FormData();
          formData.append("file", file as any)
          const res = await detectCard(formData).unwrap()
          if(res){
            handleInputChange("VisitorName", res.name)
            handleInputChange("CredentialsCard", res.id)
          }
        }
      } catch (error) {
        console.error("Error taking photo:", JSON.stringify(error, null, 2));
        Alert.alert("Error", "Failed to take photo. Please try again.");
      }
    };
    // Validation function
    const validateForm = () => {
      const {
        VisitorName,
        CompanyName,
        PhoneNumber,
        VisitorCredentialImageFromRequest,
      } = visitor;
      if (!VisitorName) {
        Alert.alert("Validation Error", "Please provide the visitor's name.");
        return false;
      }
      if (!PhoneNumber) {
        Alert.alert("Validation Error", "Please provide a phone number.");
        return false;
      }
      if (!CompanyName) {
        Alert.alert("Validation Error", "Please provide a company name.");
        return false;
      }
      if (!VisitorCredentialImageFromRequest) {
        Alert.alert("Validation Error", "Please take a photo of the ID card.");
        return false;
      }
      return true;
    };
    const handleSubmit = async () => {
      if (!validateForm()) {
        return; // If validation fails, exit the function
      }
      const formData = new FormData();
      formData.append("VisitorName", visitor.VisitorName);
      formData.append("CompanyName", visitor.CompanyName);
      formData.append("PhoneNumber", visitor.PhoneNumber);
      formData.append("CredentialsCard", visitor.CredentialsCard);
      formData.append(
        "CredentialCardTypeId",
        visitor.CredentialCardTypeId.toString()
      );
      if (visitor.VisitorCredentialImageFromRequest) {
        formData.append(
          "VisitorCredentialImageFromRequest",
          visitor.VisitorCredentialImageFromRequest
        );
      }
      try {
        const response = await createVisitor(formData).unwrap().then((res) => {
          var oldItem = [...visitCreateData.visitDetail]
          var newItem : VisitDetailType = {
            expectedEndHour : oldItem[0].expectedEndHour,
            expectedStartHour : oldItem[0].expectedStartHour,
            visitorId : res.visitorId,
            visitorCompany : visitor.CompanyName,
            visitorName: visitor.VisitorName
          }
          if(!oldItem.find(s => s.visitorId === res.visitorId)){
            oldItem.push(newItem)
          }
          visitCreateData = {
            ...visitCreateData,
            visitDetail : oldItem
          }
          dispatch(setVisitStaffCreate(visitCreateData))
        });
        Alert.alert("Thành công", "Tạo khách vãng lai thành công", [
          {
            text: "OK",
          },
        ]);
      } catch (error: any) {
        // console.error(
        //   "Failed to create visitor:",
        //   JSON.stringify(error, null, 2)
        // );
        const errors = error?.data?.errors;
        if (errors) {
          let errorMessage =
            "Failed to create visitor due to validation errors:\n";
          Object.keys(errors).forEach((field) => {
            errorMessage += `${field}: ${errors[field].join(", ")}\n`;
          });
          Alert.alert("Error", errorMessage);
        } else {
          Alert.alert("Error", "Failed to create visitor. Please try again.");
        }
      }
    };
    const handleGoBack = () => {
      router.back();
    };
 console.log("Create visitor data: ", visitor);
    return (
      <ScrollView className="flex-1 bg-gradient-to-b from-blue-50 to-white">
        <View className="p-6">
          <Text className="text-3xl font-bold mb-6 text-backgroundApp text-center">
            Tạo khách đến thăm
          </Text>
          <View className="bg-backgroundApp rounded-xl shadow-lg p-6 mb-6">
            <View className="mb-4">
              <Text className="text-sm font-semibold text-white mb-2">CCCD</Text>
              <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-white">
                <Text className="text-backgroundApp">{visitor?.CredentialsCard || ""}</Text>
              </View>
            </View>
            <View className="mb-4">
              <Text className="text-sm font-semibold text-white mb-2">
                Tên khách hàng
              </Text>
              <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-white">
                <Text className="text-backgroundApp">{visitor?.VisitorName || ""}</Text>
              </View>
            </View>
            <View className="mb-4">
              <Text className="text-sm font-semibold text-white mb-2">
                Số điện thoại
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-backgroundApp"
                value={visitor.PhoneNumber}
                onChangeText={(text) => handleInputChange("PhoneNumber", text)}
                placeholder="Nhập số điện thoại"
              />
            </View>
            <View className="mb-4">
              <Text className="text-sm font-semibold text-white mb-2">
                Tên công ty
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-backgroundApp"
                value={visitor.CompanyName}
                onChangeText={(text) => handleInputChange("CompanyName", text)}
                placeholder="Nhập tên công ty"
              />
            </View>
            <View className="mb-4">
              <TouchableOpacity
                onPress={takePhoto}
                className="bg-buttonGreen p-3 rounded-lg"
              >
                <Text className="text-white text-center">Chụp ảnh CCCD</Text>
              </TouchableOpacity>
            </View>
            {photoUri && (
              <View className="mb-4">
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: 290, height: 220 }}
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
  export default CreateVisitorForStaff;
  