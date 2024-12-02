import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Image,
  Modal,
  Alert,
  ImageBackground,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useValidCheckInMutation } from "@/redux/services/checkin.service";
import { EvilIcons, MaterialIcons } from "@expo/vector-icons";
import { CheckInVerWithLP } from "@/Types/checkIn.type";
import ImageViewer from "react-native-image-zoom-viewer";
import { MapPinIcon } from "lucide-react-native";

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

interface ImageSectionProps {
  visitorImage: string;
}

interface ValidCheckInData {
  CredentialCard: string | null;
  QRCardVerification: string;
  ImageShoe: Array<{ imageFile: string }>;
}

interface ParsedValidData {
  CredentialCard: string | null;
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

  useEffect(() => {
    const validateCheckIn = async () => {
      try {
        const dataValid = Array.isArray(params.dataValid)
          ? params.dataValid[0]
          : params.dataValid;

        const parsedValidData = JSON.parse(dataValid) as ParsedValidData;
        console.log("Parsed Valid Data:", parsedValidData);

        console.log("ImageShoe data type:", typeof parsedValidData.ImageShoe);
        console.log("ImageShoe content:", parsedValidData.ImageShoe);

        let imageShoeData: Array<{ imageFile: string }> = [];

        if (typeof parsedValidData.ImageShoe === "string") {
          console.log("Processing single image string");
          imageShoeData = [{ imageFile: parsedValidData.ImageShoe }];
        } else if (Array.isArray(parsedValidData.ImageShoe)) {
          console.log("Processing image array");
          imageShoeData = parsedValidData.ImageShoe.filter(
            (path): path is string => typeof path === "string" && path !== ""
          ).map((path) => ({ imageFile: path }));
        } else if (
          parsedValidData.ImageShoe &&
          typeof parsedValidData.ImageShoe === "object"
        ) {
          console.log("Processing image object");
          const imgFile = (parsedValidData.ImageShoe as any).imageFile;
          if (imgFile) {
            imageShoeData = [{ imageFile: imgFile }];
          }
        }

        console.log("Processed imageShoeData:", imageShoeData);

        if (imageShoeData.length === 0) {
          console.error(
            "No valid image data to send. Original data:",
            parsedValidData.ImageShoe
          );
          return;
        }

        const validCheckInData: ValidCheckInData = {
          CredentialCard: parsedValidData.CredentialCard || null,
          QRCardVerification: parsedValidData.QRCardVerification,
          ImageShoe: imageShoeData,
        };

        console.log("Final data being sent to API:", validCheckInData);
        await validCheckIn(validCheckInData);
      } catch (error: any) {
        console.error("ValidCheckIn Error:", error);

        if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }

        const errorMessage =
          error?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";

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

  const InfoRowTime = ({
    label,
    value1,
    value2,
  }: {
    label: string;
    value1: string | number;
    value2: string | number;
  }) => (
    <View className="flex-row justify-between py-2">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-black text-sm font-medium">
        {value1} - {value2}
      </Text>
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
        <View className="w-8 h-8 bg-[#16a085] rounded-full items-center justify-center mr-3">
          {icon}
        </View>
        <Text className="text-lg font-semibold text-teal-600">{title}</Text>
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
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  const ImageSection: React.FC<ImageSectionProps> = ({ visitorImage }) => {
    const [isImageViewVisible, setIsImageViewVisible] = useState(false);

    const images = [
      {
        url: `data:image/png;base64,${visitorImage}`,
        props: {
          source: {
            uri: `data:image/png;base64,${visitorImage}`,
          },
        },
      },
    ];

    return (
      <View className="mt-4 items-center">
        <Text className="text-gray-500 text-sm mb-2">Ảnh giấy tờ</Text>

        <TouchableOpacity
          onPress={() => setIsImageViewVisible(true)}
          className="w-32 h-32"
        >
          <Image
            source={{
              uri: `data:image/png;base64,${visitorImage}`,
            }}
            className="w-46 h-32"
          />
        </TouchableOpacity>

        <Modal
          visible={isImageViewVisible}
          transparent={true}
          onRequestClose={() => setIsImageViewVisible(false)}
        >
          <ImageViewer
            imageUrls={images}
            enableSwipeDown={true}
            onSwipeDown={() => setIsImageViewVisible(false)}
            onCancel={() => setIsImageViewVisible(false)}
            backgroundColor="rgba(0, 0, 0, 0.9)"
            renderHeader={() => (
              <TouchableOpacity
                onPress={() => setIsImageViewVisible(false)}
                style={{
                  position: "absolute",
                  top: 40,
                  right: 20,
                  zIndex: 100,
                  padding: 10,
                }}
              >
                <Text style={{ color: "white", fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          />
        </Modal>
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
    <ScrollView className="flex-1 bg-gray-50">
      <View className="relative">
        <Pressable
          onPress={handleGoBack}
          className="absolute top-6 left-2 flex flex-row items-center space-x-2 px-4 py-2 rounded-lg mt-4 z-10"
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
          <Text className="text-white font-medium">Quay về</Text>
        </Pressable>

        <ImageBackground
          source={{
            uri: "https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg",
          }}
          className="w-full h-72"
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-black/40" />
        </ImageBackground>

        <View className="p-4 bottom-[160px]">
          <View className="mb-8">
            <Section title="Thông tin cơ bản">
              <View className="items-center mb-4">
                <View className="flex-row items-center mt-1">
                  {/* <MapPinIcon size={28} className="text-blue-600 mr-2" /> */}
                  <Text className="text-xl font-bold text-teal-600 text-center">
                    {response?.visit.visitName}
                  </Text>
                </View>
                <View className="w-2/3 h-0.5 bg-gray-200 mt-2" />
              </View>
              <InfoRowTime
                label="Thời gian (dự kiến)"
                value1={response?.expectedStartHour}
                value2={response?.expectedEndHour}
              />
              <InfoRow
                label="Tên khách"
                value={response?.visitor.visitorName}
              />
              <View className="flex-row justify-around mt-4">
                {response?.visitor.visitorCredentialFrontImage && (
                  <ImageSection
                    visitorImage={response?.visitor.visitorCredentialFrontImage}
                  />
                )}
              
               
              </View>
            </Section>
          </View>

          <View className="bg-gray-50 rounded-3xl mb-4">
            <Text className="text-2xl font-semibold mb-6 text-[#34495e]">
              Thông tin chi tiết
            </Text>
            <SectionDropDown
              title="Thông tin chuyến thăm"
              icon={<View className="w-6 h-6 bg-orange-500 rounded-full" />}
            >
              <InfoRow label="Chuyến thăm" value={response?.visit.visitName} />
              <InfoRowTime
                label="Thời gian (dự kiến)"
                value1={response?.expectedStartHour}
                value2={response?.expectedEndHour}
              />
              <InfoRow label="Số lượng" value={response?.visit.visitQuantity} />
            </SectionDropDown>
            <SectionDropDown
              title="Thông tin khách"
              icon={<View className="w-6 h-6 bg-blue-500 rounded-full" />}
            >
              <InfoRow
                label="Tên khách"
                value={response?.visitor.visitorName}
              />
              <InfoRow label="Công ty" value={response?.visitor.companyName} />
              <InfoRow
                label="Số điện thoại"
                value={response?.visitor.phoneNumber}
              />
              <InfoRow
                label="CMND/CCCD"
                value={response?.visitor.credentialsCard}
              />

              {response?.visitor.visitorCredentialFrontImage && (
                <ImageSection
                  visitorImage={response?.visitor.visitorCredentialFrontImage}
                />
              )}
            </SectionDropDown>
            <SectionDropDown
              title="Thông tin thẻ"
              icon={<View className="w-6 h-6 bg-green-500 rounded-full" />}
            >
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

            <ImageSectionDropdown
              title="Hình ảnh check in"
              icon={<View className="w-6 h-6 bg-yellow-500 rounded-full" />}
              imageUris={[
                checkInData?.Images?.[0]?.Image,
                checkInData?.Images?.[1]?.Image,
              ].filter(Boolean)}
            />

            {checkInData?.VehicleSession?.vehicleImages?.[0]?.Image && (
              <SectionDropDown
                title="Hình ảnh biển số xe"
                icon={<View className="w-6 h-6 bg-pink-500 rounded-full" />}
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
                      <Text className="text-white text-xs ml-1">
                        Ảnh biển số
                      </Text>
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
      </View>
    </ScrollView>
  );
};

export default ValidCheckInScreen;
