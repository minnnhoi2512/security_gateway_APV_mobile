import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Image,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useValidCheckInMutation } from "@/redux/services/checkin.service";
import { EvilIcons, MaterialIcons } from "@expo/vector-icons";
import { CheckInVerWithLP } from "@/Types/checkIn.type";
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

interface ValidCheckInData {
  CredentialCard: number | null;  
  QRCardVerification: string;
  ImageShoe: Array<{ imageFile: string }>;
}

interface ParsedValidData {
  CredentialCard: number | null;  
  QRCardVerification: string;
  ImageShoe: string | string[];
}


const ValidCheckInScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const checkInString = params.dataCheckIn as string;
  const checkInData: CheckInVerWithLP = checkInString
    ? JSON.parse(checkInString)
    : null;
  const [
    validCheckIn,
    { data: response, error, isLoading: isLoadingValidRes },
  ] = useValidCheckInMutation();

  console.log("Check in da: ", params.dataValid);
  console.log("Check in da res: ", response);

   
  useEffect(() => {
    const validateCheckIn = async () => {
      try {
        const dataValid = Array.isArray(params.dataValid)
          ? params.dataValid[0]
          : params.dataValid;
  
        const parsedValidData = JSON.parse(dataValid) as ParsedValidData;
        console.log("Parsed Valid Data:", parsedValidData);
  
        // Kiểm tra chi tiết dữ liệu ImageShoe
        console.log("ImageShoe data type:", typeof parsedValidData.ImageShoe);
        console.log("ImageShoe content:", parsedValidData.ImageShoe);
  
        // Xử lý dữ liệu ImageShoe một cách chi tiết hơn
        let imageShoeData: Array<{ imageFile: string }> = [];
  
        if (typeof parsedValidData.ImageShoe === 'string') {
          // Nếu ImageShoe là string
          console.log("Processing single image string");
          imageShoeData = [{ imageFile: parsedValidData.ImageShoe }];
        } else if (Array.isArray(parsedValidData.ImageShoe)) {
          // Nếu ImageShoe là mảng
          console.log("Processing image array");
          imageShoeData = parsedValidData.ImageShoe
            .filter((path): path is string => typeof path === 'string' && path !== '')
            .map(path => ({ imageFile: path }));
        } else if (parsedValidData.ImageShoe && typeof parsedValidData.ImageShoe === 'object') {
          // Nếu ImageShoe đã là object có imageFile
          console.log("Processing image object");
          const imgFile = (parsedValidData.ImageShoe as any).imageFile;
          if (imgFile) {
            imageShoeData = [{ imageFile: imgFile }];
          }
        }
  
        console.log("Processed imageShoeData:", imageShoeData);
  
        if (imageShoeData.length === 0) {
          console.error("No valid image data to send. Original data:", parsedValidData.ImageShoe);
          return;
        }
  
        // Convert CredentialCard to number if it's a string
        const credentialCard = typeof parsedValidData.CredentialCard === 'string' 
          ? parseInt(parsedValidData.CredentialCard, 10) 
          : parsedValidData.CredentialCard;
  
        const validCheckInData: ValidCheckInData = {
          CredentialCard: credentialCard,
          QRCardVerification: parsedValidData.QRCardVerification,
          ImageShoe: imageShoeData
        };
  
        console.log("Final data being sent to API:", validCheckInData);
        await validCheckIn(validCheckInData);
  
      } catch (err) {
        console.error("ValidCheckIn Error:", err);
        // Log chi tiết lỗi để debug
        if (err instanceof Error) {
          console.error("Error name:", err.name);
          console.error("Error message:", err.message);
          console.error("Error stack:", err.stack);
        }
      }
    };
  
    validateCheckIn();
  }, [params.dataValid]);

  const handleNext = () => {
    router.push({
      pathname: "/check-in/CheckInOverall",
      params: {
        dataCheckIn: JSON.stringify(checkInData),
      },
    });
  };

  //  console.log("Response valid: ", response);

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
  
  if (isLoadingValidRes) {
    return (
      <View className="flex-1 items-center justify-center bg-backgroundApp">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Đang xử lý...</Text>
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
                Hôm nay, {response?.expectedStartHour}
              </Text>
            </View>
            <InfoRow label="Giờ bắt đầu" value={response?.expectedStartHour} />
            <InfoRow label="Giờ kết thúc" value={response?.expectedEndHour} />
            <InfoRow label="Tên cuộc thăm" value={response?.visit.visitName} />
            <InfoRow label="Số lượng" value={response?.visit.visitQuantity} />
            <InfoRow
              label="Loại lịch"
              value={response?.visit.scheduleTypeName}
            />
            <Text>Thông tin khách hàng</Text>
            <InfoRow label="Tên khách" value={response?.visitor.visitorName} />
            <InfoRow label="Công ty" value={response?.visitor.companyName} />
            <InfoRow
              label="Số điện thoại"
              value={response?.visitor.phoneNumber}
            />
            <InfoRow
              label="CMND/CCCD"
              value={response?.visitor.credentialsCard}
            />
          </Section>
          <SectionDropDown
            title="Thông tin thẻ"
            icon={<View className="w-6 h-6 bg-green-500 rounded-full" />}
          >
            <InfoRow
              label="Mã xác thực"
              value={response?.cardRes.cardVerification}
            />

            {response?.cardRes.cardImage && (
              <View className="mt-4 items-center">
                <Text className="text-gray-500 text-sm mb-2">QR Code</Text>
                <Image
                  source={{
                    uri: `data:image/png;base64,${response?.cardRes.cardImage}`,
                  }}
                  className="w-32 h-32"
                  resizeMode="contain"
                />
              </View>
            )}
          </SectionDropDown>

          {/* <ImageSectionDropdown
            title="Hình ảnh giày"
            icon={<View className="w-6 h-6 bg-yellow-500 rounded-full" />}
          >
            {checkInData?.Images?.length > 0 && checkInData.Images[0].Image && (
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
          </ImageSectionDropdown> */}
          <ImageSectionDropdown
            title="Hình ảnh giày và body"
            icon={<View className="w-6 h-6 bg-yellow-500 rounded-full" />}
            imageUris={[
              checkInData?.Images?.[0]?.Image, // Body image
              checkInData?.Images?.[1]?.Image, // Shoe image
            ].filter(Boolean)} // Filter to avoid null/undefined URIs
          />

          {checkInData?.VehicleSession?.vehicleImages?.[0]?.Image && (
            <SectionDropDown
              title="Hình ảnh biển số xe"
              icon={<View className="w-6 h-6 bg-blue-500 rounded-full" />}
            >
              <View>
                {checkInData.VehicleSession?.LicensePlate && (
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
            <Text className="text-lg mr-2">Tiến hành check in</Text>
            <EvilIcons name="arrow-right" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ValidCheckInScreen;
