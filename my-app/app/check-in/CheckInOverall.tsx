import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Pressable,
  StyleSheet,
  Modal,
} from "react-native";
import { EvilIcons, MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { CheckInVerWithLP } from "@/Types/checkIn.type";
import {
  useCheckInMutation,
  useValidCheckInMutation,
} from "@/redux/services/checkin.service";
import { uploadToFirebase } from "@/firebase-config";
import { useToast } from "@/components/Toast/ToastContext";
import ImageViewer from "react-native-image-zoom-viewer";

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

interface ImageSectionDropdownProps {
  title: string;
  icon: React.ReactNode;
  imageUris: string[]; 
}


const CheckInOverall = () => {
  const { dataCheckIn } = useLocalSearchParams();
  const [checkInStatus, setCheckInStatus] = useState<
    "pending" | "success" | "error"
  >("pending");

  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const router = useRouter();
  const { showToast } = useToast();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [checkInMessage, setCheckInMessage] = useState<string>("");
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );

  const parsedDataCheckIn = useMemo(() => {
    try {
      if (typeof dataCheckIn === "string") {
        const parsed = JSON.parse(dataCheckIn);
        if (parsed.__type === "CheckInVerWithLP") {
          delete parsed.__type;
          return {
            ...parsed,
            VehicleSession: parsed.VehicleSession || {
              LicensePlate: "",
              vehicleImages: [],
            },
          };
        }
        return parsed;
      }
      return dataCheckIn;
    } catch (error) {
      console.error("Error parsing dataCheckIn:", error);
      return null;
    }
  }, [dataCheckIn]);

  const [checkInData, setCheckInData] = useState<CheckInVerWithLP>({
    CredentialCard: parsedDataCheckIn?.CredentialCard || null,
    SecurityInId: parsedDataCheckIn?.SecurityInId || 0,
    GateInId: parsedDataCheckIn?.GateInId || Number(selectedGateId) || 0,
    QrCardVerification: parsedDataCheckIn?.QrCardVerification || "",
    Images: parsedDataCheckIn?.Images || [],
    VehicleSession: parsedDataCheckIn?.VehicleSession || {
      LicensePlate: "",
      vehicleImages: [],
    },
  });

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setCheckInData((prevState) => ({
            ...prevState,
            SecurityInId: Number(storedUserId) || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const performCheckIn = async () => {
      setCheckInMessage("");
      setCheckInStatus("pending");
  
      try {
        if (
          !checkInData ||
          !checkInData.Images ||
          checkInData.Images.length < 1 
          // ||  
          // !checkInData.Images[0] ||
          // !checkInData.Images[1]
        ) {
          throw new Error("Missing image data for check-in.");
        }
  
        const formData = new FormData();
  
        
        formData.append(
          "CredentialCard",
          checkInData.CredentialCard ? checkInData.CredentialCard.toString() : ""
        );
        formData.append("SecurityInId", checkInData.SecurityInId.toString());
        formData.append("GateInId", checkInData.GateInId.toString());
        formData.append("QrCardVerification", checkInData.QrCardVerification);
  
      
        const shoeImage = checkInData.Images[1];  
        const { downloadUrl: shoeImageUrl } = await uploadToFirebase(
          shoeImage.Image,
          `shoe_${Date.now()}.jpg`
        );
        formData.append("Images[1].ImageType", shoeImage.ImageType);
        formData.append("Images[1].ImageURL", shoeImageUrl.replace(/"/g, ""));
        formData.append("Images[1].Image", {
          uri: shoeImage.Image,
          name: shoeImage.Image.split("/").pop() || "default.jpg",
          type: "image/jpeg",
        } as any);
  
       
        const bodyImage = checkInData.Images[0];   
        const { downloadUrl: bodyImageUrl } = await uploadToFirebase(
          bodyImage.Image,
          `body_${Date.now()}.jpg`
        );
        formData.append("Images[0].ImageType", bodyImage.ImageType);
        formData.append("Images[0].ImageURL", bodyImageUrl.replace(/"/g, ""));
        formData.append("Images[0].Image", {
          uri: bodyImage.Image,
          name: bodyImage.Image.split("/").pop() || "default.jpg",
          type: "image/jpeg",
        } as any);
 
        if (
          checkInData.VehicleSession &&
          checkInData.VehicleSession.LicensePlate &&
          checkInData.VehicleSession.vehicleImages &&
          checkInData.VehicleSession.vehicleImages.length > 0
        ) {
          formData.append(
            "VehicleSession.LicensePlate",
            checkInData.VehicleSession.LicensePlate
          );
  
          const vehicleImage = checkInData.VehicleSession.vehicleImages[0];
  
          if (vehicleImage && vehicleImage.Image) {
            const { downloadUrl: licensePlateImageUrl } =
              await uploadToFirebase(
                vehicleImage.Image,
                `license_plate_${Date.now()}.jpg`
              );
  
            formData.append(
              "VehicleSession.VehicleImages[0].ImageType",
              "LicensePlate_In"
            );
            formData.append(
              "VehicleSession.VehicleImages[0].ImageURL",
              licensePlateImageUrl.replace(/"/g, "")
            );
          }
        }
  
        console.log("Form data being sent:", formData);
   
        const response = await checkIn(formData).unwrap();
        setResultData(response);
        setCheckInStatus("success");
        setCheckInMessage("Bạn vừa check in thành công!");
        showToast("Bạn vừa check in thành công!", "success");
      } catch (error: any) {
        console.log("err check in:", error);
        setCheckInStatus("error");
        const errorMessage =
          error?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
        showToast("Đã có lỗi xảy ra", "error");
        Alert.alert("Đã có lỗi xảy ra", errorMessage, [
          {
            text: "OK",
            onPress: () => {
              router.push("/(tabs)/checkin");
            },
          },
        ]);
      }
    };
  
    performCheckIn();
  }, []);
  
  const handleGoBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push({
      pathname: "/(tabs)/checkin",
    });
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

  const ImageSectionDropdown: React.FC<ImageSectionDropdownProps> = ({
    title,
    icon,
    imageUris,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Track which image is opened in viewer
  
    if (!imageUris || imageUris.length === 0) return null;
  
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
  
        {isOpen && (
          <View className="p-4">
            {imageUris.map((uri, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedImageIndex(index);
                  setIsImageViewerVisible(true);
                }}
              >
                <Image
                  source={{ uri: uri }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 10,
                    marginVertical: 10,
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
  
            <Modal visible={isImageViewerVisible} transparent={true}>
              <ImageViewer
                imageUrls={imageUris.map((uri) => ({ url: uri }))}
                enableSwipeDown
                index={selectedImageIndex}
                onSwipeDown={() => setIsImageViewerVisible(false)}
                onClick={() => setIsImageViewerVisible(false)}
                backgroundColor="rgba(0,0,0,0.9)"
              />
            </Modal>
          </View>
        )}
      </View>
    );
  };

  if (checkInStatus === "pending") {
    return (
      <View className="flex-1 items-center justify-center bg-backgroundApp">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Đang xử lý...</Text>
      </View>
    );
  }

  if (checkInStatus === "error") {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Đã có lỗi xảy ra. Vui lòng thử lại.</Text>
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

  console.log("Valid c dâta ben ovrr", dataCheckIn);
  // console.log("RS DATA", resultData);

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
            <InfoRow label="Giờ bắt đầu" value={resultData.expectedStartHour} />
            <InfoRow label="Giờ kết thúc" value={resultData.expectedEndHour} />
            <InfoRow label="Tên cuộc thăm" value={resultData.visit.visitName} />
            <InfoRow label="Số lượng" value={resultData.visit.visitQuantity} />
            <InfoRow
              label="Loại lịch"
              value={resultData.visit.scheduleTypeName}
            />
            <Text>Thông tin khách hàng</Text>
            <InfoRow label="Tên khách" value={resultData.visitor.visitorName} />
            <InfoRow label="Công ty" value={resultData.visitor.companyName} />
            <InfoRow
              label="Số điện thoại"
              value={resultData.visitor.phoneNumber}
            />
            <InfoRow
              label="CMND/CCCD"
              value={resultData.visitor.credentialsCard}
            />
          </Section>
          <SectionDropDown
            title="Thông tin thẻ"
            icon={<View className="w-6 h-6 bg-green-500 rounded-full" />}
          >
            <InfoRow
              label="Mã xác thực"
              value={resultData.cardRes.cardVerification}
            />

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

          {/* <SectionDropDown
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
          </SectionDropDown> */}
             <ImageSectionDropdown
            title="Hình ảnh giày và body"
            icon={<View className="w-6 h-6 bg-yellow-500 rounded-full" />}
            imageUris={[
              checkInData?.Images?.[0]?.Image, // Body image
              checkInData?.Images?.[1]?.Image, // Shoe image
            ].filter(Boolean)} // Filter to avoid null/undefined URIs
          />

          {checkInData.VehicleSession?.vehicleImages?.[0]?.Image && (
            <SectionDropDown
              title="Hình ảnh biển số xe"
              icon={<View className="w-6 h-6 bg-blue-500 rounded-full" />}
            >
              <View>
                {checkInData.VehicleSession.LicensePlate && (
                  <View className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <Text className="text-gray-800 text-center text-lg font-semibold">
                      Biển số: {checkInData.VehicleSession.LicensePlate}
                    </Text>
                  </View>
                )}

                <View className="relative">
                  <Image
                    source={{
                      uri: checkInData.VehicleSession.vehicleImages[0].Image,
                    }}
                    className="w-full h-48 rounded-lg"
                    resizeMode="contain"
                  />

                  <View className="absolute top-2 left-2 bg-blue-500 px-2 py-1 rounded-full flex-row items-center">
                    <MaterialIcons
                      name="directions-car"
                      size={12}
                      color="white"
                    />
                    <Text className="text-white text-xs ml-1">Ảnh biển số</Text>
                  </View>
                </View>
              </View>
            </SectionDropDown>
          )}
          <TouchableOpacity
            onPress={handleNext}
            className="p-4 mb-4 bg-white rounded-full flex-row items-center justify-center"
          >
            <Text className="text-lg mr-2">Xong</Text>
            <EvilIcons name="arrow-right" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      {isCheckingIn && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-3xl" style={styles.loadingText}>
            Đang xử lý...
          </Text>
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
  },
});
