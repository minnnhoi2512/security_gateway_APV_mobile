import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckInVer02 } from "@/Types/checkIn.type";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCheckInMutation } from "@/redux/services/checkin.service";
import { uploadToFirebase } from "@/firebase-config";
import { EvilIcons, MaterialIcons } from "@expo/vector-icons";

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
  status: boolean;
  visitor: Visitor;
  visit: Visit;
  cardRes: Card;
}

interface ImageData {
  imageType: "Shoe";
  imageFile: string | null;
}

const CheckInOverall = () => {
  const { resultData, validData } = useLocalSearchParams();
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  let data: ResultData | null = null;
  const router = useRouter();
  try {
    if (resultData) {
      data = JSON.parse(resultData as string);
    }
  } catch (error) {
    console.error("Error parsing resultData:", error);
    // Handle error (e.g., show a message to the user)
  }
  const [userId, setUserId] = useState<string | null>(null);
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );

  console.log("valid da: ", validData);

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
    if (validData) {
      try {
        const parsedValidData = JSON.parse(validData as string);

        // Update checkInData with parsedValidData
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
        // Handle error (e.g., set default values or show a message)
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
      const errorMessage = error.data?.message || "Please ensure all requirements are met.";
      // console.error("Check-in error:", error);
      Alert.alert("Đã có lỗi xảy ra", "Check-in thất bại. Vui lòng thử lại.", errorMessage);
    } finally {
      // setIsUploading(false);
    }
  };
  const handleGoBack = () => {
    router.back();
  };
  // console.log("CHECKKK IINNNN DATA: ", checkInData);
  // console.log("CHECKKK IINNNN DATA RES: ", resultData);
  console.log("CHECKKK IINNNN DATA V: ", validData);

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

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Không có dữ liệu</Text>
      </View>
    );
  }

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
                Hôm nay, {data.expectedStartHour}
              </Text>
            </View>
            <InfoRow label="Mã chi tiết thăm" value={data.visitDetailId} />
            <InfoRow label="Giờ bắt đầu" value={data.expectedStartHour} />
            <InfoRow label="Giờ kết thúc" value={data.expectedEndHour} />
            <InfoRow
              label="Trạng thái"
              value={data.status ? "Hoạt động" : "Không hoạt động"}
            />
          </Section>
          <SectionDropDown
            title="Thông tin thăm"
            icon={<View className="w-6 h-6 bg-purple-500 rounded-full" />}
          >
            <InfoRow label="Tên cuộc thăm" value={data.visit.visitName} />
            <InfoRow label="Số lượng" value={data.visit.visitQuantity} />
            <InfoRow label="Loại lịch" value={data.visit.scheduleTypeName} />
          </SectionDropDown>
          <SectionDropDown
            title="Thông tin khách"
            icon={<View className="w-6 h-6 bg-blue-500 rounded-full" />}
          >
            <InfoRow label="Tên khách" value={data.visitor.visitorName} />
            <InfoRow label="Công ty" value={data.visitor.companyName} />
            <InfoRow label="Số điện thoại" value={data.visitor.phoneNumber} />
            <InfoRow label="CMND/CCCD" value={data.visitor.credentialsCard} />
            <InfoRow label="Trạng thái" value={data.visitor.status} />
          </SectionDropDown>

          <SectionDropDown
            title="Thông tin thẻ"
            icon={<View className="w-6 h-6 bg-green-500 rounded-full" />}
          >
            <InfoRow label="Mã thẻ" value={data.cardRes.cardId} />
            <InfoRow
              label="Mã xác thực"
              value={data.cardRes.cardVerification}
            />
            <InfoRow label="Trạng thái thẻ" value={data.cardRes.cardStatus} />

            {data.cardRes.cardImage && (
              <View className="mt-4 items-center">
                <Text className="text-gray-500 text-sm mb-2">QR Code</Text>
                <Image
                  source={{
                    uri: `data:image/png;base64,${data.cardRes.cardImage}`,
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
    </ScrollView>
  );
};

export default CheckInOverall;
