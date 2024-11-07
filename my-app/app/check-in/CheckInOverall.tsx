import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Pressable,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckInVer02, ValidCheckIn } from "@/Types/checkIn.type";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useCheckInMutation,
  useValidCheckInMutation,
} from "@/redux/services/checkin.service";
import { uploadToFirebase } from "@/firebase-config";
import { EvilIcons, MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";

interface Visitor {
  visitorId: number;
  visitorName: string;
  companyName: string;
  phoneNumber: string;
  credentialsCard: string;
  visitorCredentialImage: string;
  status: string;
}

interface Visit {
  visitId: number;
  visitName: string;
  visitQuantity: number;
  createByname: string | null;
  scheduleTypeName: string;
}

interface Card {
  cardId: number;
  cardVerification: string;
  cardImage: string;
  cardStatus: string;
  qrCardTypename: string | null;
}

interface ResultData {
  visitDetailId: number;
  expectedStartHour: string;
  expectedEndHour: string;
  status: string;
  visitor: Visitor;
  visit: Visit;
  cardRes: Card;
}

interface ImageData {
  imageType: "Shoe";
  imageFile: string | null;
}

const CheckInOverall = () => {
  const { validData } = useLocalSearchParams();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [validCheckIn, { isLoading: isValidCheckingIn }] =
    useValidCheckInMutation();
  const router = useRouter();

  useEffect(() => {
    const validateCheckInData = async () => {
      setIsValidating(true);
      try {
        let parsedValidData: ValidCheckIn;

        if (typeof validData === "string") {
          parsedValidData = JSON.parse(validData);
        } else if (Array.isArray(validData)) {
          parsedValidData = {
            CredentialCard: null,
            QrCardVerification: validData[0],
            ImageShoe: validData.slice(1).map((img) => ({
              imageType: "Shoe",
              imageFile: img,
            })),
          };
        } else {
          throw new Error("Invalid validData format");
        }

        if (parsedValidData.ImageShoe.length !== 1) {
          throw new Error("ImageShoe must contain exactly one image");
        }

        const result = await validCheckIn(parsedValidData).unwrap();
        setResultData(result);
      } catch (error: any) {
        const errorMessage =
          error.data?.message ||
          error.message ||
          "Please ensure all requirements are met.";
        Alert.alert("Validation Error", errorMessage);
      } finally {
        setIsValidating(false);
      }
    };

  
    setTimeout(() => {
      if (validData) validateCheckInData();
    }, 300); 

  }, [validData]);

  const [userId, setUserId] = useState<string | null>(null);
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );

  const [checkInData, setCheckInData] = useState<CheckInVer02>({
    CredentialCard: null,
    SecurityInId: 0,
    GateInId: Number(selectedGateId) || 0,
    QrCardVerification: "",
    Images: [],
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

  useEffect(() => {
    if (validData) {
      try {
        const parsedValidData = JSON.parse(validData as string);

        setCheckInData((prevState) => ({
          ...prevState,
          CredentialCard: parsedValidData.CredentialCard || null,
          QrCardVerification: parsedValidData.QrCardVerification || "",
          Images: [
            ...prevState.Images,
            ...parsedValidData.ImageShoe.map((image: ImageData) => ({
              ImageType: image.imageType,
              ImageURL: "",
              Image: image.imageFile,
            })),
          ],
        }));
      } catch (error) {
        console.error("Error parsing validData:", error);
      }
    }
  }, [validData]);

  const handleCheckIn = async () => {
    // if (!isCheckInEnabled || capturedImage.length !== 1) {
    //   Alert.alert("Error", "Please ensure exactly one shoe image is captured.");
    //   return;
    // }

    // setIsUploading(true);
    try {
      const formData = new FormData();
      // formData.append("CredentialCard", checkInData.CredentialCard.toString());
      formData.append(
        "CredentialCard",
        checkInData.CredentialCard ? checkInData.CredentialCard.toString() : ""
      );
      formData.append("SecurityInId", checkInData.SecurityInId.toString());
      formData.append("GateInId", checkInData.GateInId.toString());
      formData.append("QrCardVerification", checkInData.QrCardVerification);

      const image = checkInData.Images[0];
      const { downloadUrl } = await uploadToFirebase(
        image.Image,
        `${image.ImageType}_${Date.now()}.jpg`
      );

      const localUri = image.Image;
      const filename = localUri
        ? localUri.split("/").pop() || "default.jpg"
        : "default.jpg";
      const type = "image/jpeg";

      formData.append("Images[0].ImageType", image.ImageType);
      formData.append("Images[0].ImageURL", downloadUrl.replace(/"/g, ""));
      formData.append("Images[0].Image", {
        uri: localUri || "",
        name: filename,
        type,
      } as any);

      const response = await checkIn(formData).unwrap();
      // console.log("DATA PASS CHECKIN...: ", response.data);

      router.push({
        pathname: "/(tabs)/checkin",
        params: { data: JSON.stringify(response) },
      });
      console.log("DATA CI DONE...: ", response);
      Alert.alert("Thành công", "Bạn vừa check in thành công!");
    } catch (error: any) {
      const errorMessage =
        error.data?.message || "Please ensure all requirements are met.";
      console.error("Check-in error:", error);
      Alert.alert(
        "Đã có lỗi xảy ra",
        "Check-in thất bại. Vui lòng thử lại.",
        error
      );
    } finally {
      // setIsUploading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <View className="flex-row justify-between py-2">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-black text-sm font-medium">{value}</Text>
    </View>
  );

  const Section = ({
    children,
    icon,
    title,
  }: {
    children: React.ReactNode;
    icon?: React.ReactNode;
    title: string;
  }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
          {icon}
        </View>
        <Text className="text-lg font-semibold text-black">{title}</Text>
      </View>
      {children}
    </View>
  );

  const SectionDropDown = ({
    children,
    icon,
    title,
  }: {
    children: React.ReactNode;
    icon?: React.ReactNode;
    title: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <View className="bg-white rounded-2xl mb-4 shadow-sm">
        <TouchableOpacity
          onPress={() => setIsOpen((prev) => !prev)}
          className="p-4 flex-row items-center"
        >
          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
            {icon}
          </View>
          <Text className="text-lg font-semibold text-black">{title}</Text>
        </TouchableOpacity>
        {isOpen && <View className="p-4">{children}</View>}
      </View>
    );
  };

  if (isValidating || isValidCheckingIn) {
    return (
      <View className="flex-1 items-center justify-center bg-backgroundApp">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Đang kiểm tra thông tin...</Text>
      </View>
    );
  }
  if (!resultData) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Không có dữ liệu</Text>
      </View>
    );
  }

  console.log("Valid c dâta ben ovrr", validData);
  

  return (
    <ScrollView className="flex-1 bg-backgroundApp">
      <View className="mt-[15%] bg-backgroundApp">
        <Pressable
          onPress={handleGoBack}
          className="flex flex-row items-center space-x-2 px-4 py-2 bg-backgroundApp rounded-lg active:bg-gray-200"
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
          <Text className="text-white font-medium">Quay về</Text>
        </Pressable>
      </View>
      <View className="flex-1 mt-[5%]">
        <View className="p-4">
          <Section title="Thông tin cơ bản">
            <View className="flex-row items-center mb-4">
              <Text className="text-gray-600 text-lg">
                Hôm nay, {resultData.expectedStartHour}
              </Text>
            </View>
            {/* <InfoRow label="Mã chi tiết thăm" value={data.visitDetailId} /> */}
            <InfoRow label="Giờ bắt đầu" value={resultData.expectedStartHour} />
            <InfoRow label="Giờ kết thúc" value={resultData.expectedEndHour} />
            {/* <InfoRow
            label="Trạng thái"
            value={data.status  ? "Hoạt động" : "Không hoạt động"}
          /> */}
          </Section>
          <SectionDropDown
            title="Thông tin thăm"
            icon={<View className="w-6 h-6 bg-purple-500 rounded-full" />}
          >
            <InfoRow label="Tên cuộc thăm" value={resultData.visit.visitName} />
            <InfoRow label="Số lượng" value={resultData.visit.visitQuantity} />
            <InfoRow label="Loại lịch" value={resultData.visit.scheduleTypeName} />
          </SectionDropDown>
          <SectionDropDown
            title="Thông tin khách"
            icon={<View className="w-6 h-6 bg-blue-500 rounded-full" />}
          >
            <InfoRow label="Tên khách" value={resultData.visitor.visitorName} />
            <InfoRow label="Công ty" value={resultData.visitor.companyName} />
            <InfoRow label="Số điện thoại" value={resultData.visitor.phoneNumber} />
            <InfoRow label="CMND/CCCD" value={resultData.visitor.credentialsCard} />
            {/* <InfoRow
            label="Trạng thái"
            value={data.visitor.status === "Active" ? "Hoạt động" : "Không hoạt động"}
          /> */}
          </SectionDropDown>

          <SectionDropDown
            title="Thông tin thẻ"
            icon={<View className="w-6 h-6 bg-green-500 rounded-full" />}
          >
            {/* <InfoRow label="Mã thẻ" value={data.cardRes.cardId} /> */}
            <InfoRow
              label="Mã xác thực"
              value={resultData.cardRes.cardVerification}
            />
            {/* <InfoRow label="Trạng thái thẻ" value={data.cardRes.cardStatus} /> */}
            {/* <InfoRow
            label="Trạng thái"
            value={data.cardRes.cardStatus === "Active" ? "Hoạt động" : "Không hoạt động"}
          /> */}

            {resultData.cardRes.cardImage && (
              <View className="mt-4 items-center">
                <Text className="text-gray-500 text-sm mb-2">QR Code</Text>
                <Image
                  source={{
                    uri: `data:image/png;base64,${resultData.cardRes.cardImage}`,
                  }}
                  className="w-32 h-32"
                  resizeMode="contain"
                />
              </View>
            )}
          </SectionDropDown>
          <SectionDropDown
            title="Hình ảnh giày"
            icon={<View className="w-6 h-6 bg-yellow-500 rounded-full" />}
          >
            {checkInData.Images.length > 0 && checkInData.Images[0].Image && (
              <Image
                source={{ uri: checkInData.Images[0].Image }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 10,
                  marginVertical: 10,
                }}
                resizeMode="contain"
              />
            )}
          </SectionDropDown>
          <TouchableOpacity
            onPress={handleCheckIn}
            className="p-4 mb-4 bg-white rounded-full flex-row items-center justify-center"
          >
            <Text className="text-lg mr-2">Check In</Text>
            <EvilIcons name="arrow-right" size={30} color="black" />
            {/* Change 'black' to your desired color */}
          </TouchableOpacity>
        </View>
      </View>
      {isCheckingIn && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Đang xử lý...</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default CheckInOverall;

const styles = StyleSheet.create({
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