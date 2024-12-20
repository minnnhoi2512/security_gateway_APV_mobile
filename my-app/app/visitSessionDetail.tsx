import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import {
  useGetVisitorSessionImagesQuery,
  useGetVisitorSessionImageVehicleQuery,
} from "@/redux/services/visitorSession.service";

interface VisitorSessionImage {
  visitorSessionsImageId: number;
  imageType:
    | "CheckIn_Body"
    | "CheckIn_Shoe"
    | "CheckOut_Body"
    | "CheckOut_Shoe";
  imageURL: string;
}

interface VisitorImagesProps {
  visitorSessionImage: VisitorSessionImage[];
}

interface ImageSectionProps {
  images: VisitorSessionImage[];
  title: string;
}

const visitSessionDetail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionData = JSON.parse(params.sessionData as string);

  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;

  const {
    data: visitorSessionImage,
    isLoading: isLoadingVisitorSS,
    isError: isErrVisitorSS,
    refetch: refetchVSS,
  } = useGetVisitorSessionImagesQuery(sessionId);

  const {
    data: visitorSessionImageVe,
    isLoading: isLoadingVisitorSSVe,
    isError: isErrVisitorSSVe,
    refetch: refetchVSSVe,
  } = useGetVisitorSessionImageVehicleQuery(sessionId);

  console.log("visitorSSIMAGE: ", visitorSessionImage);
  console.log("visitorSSIMAGE Vehicle: ", visitorSessionImageVe);

  const renderImageSection: React.FC<ImageSectionProps> = ({
    images,
    title,
  }) => {
    if (!images || images.length === 0) return null;

    return (
      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons
            name={title.includes("Vào") ? "login" : "logout"}
            size={20}
            color={title.includes("Vào") ? "#22C55E" : "#EF4444"}
          />
          <Text className="text-gray-700 font-medium text-lg ml-2">
            {title}
          </Text>
        </View>
        <View className="flex-row flex-wrap">
          {images.map((img) => (
            <View key={img.visitorSessionsImageId} className="w-1/2 p-1">
              <View className="bg-white rounded-xl overflow-hidden shadow-sm">
                <Image
                  source={{ uri: img.imageURL }}
                  className="w-full h-48"
                  resizeMode="cover"
                />
                <View className="p-2 bg-gray-50">
                  <Text className="text-gray-600 text-sm">
                    {img.imageType.includes("Body")
                      ? "Ảnh toàn thân"
                      : "Ảnh giày dép"}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const VisitorImages: React.FC<VisitorImagesProps> = ({
    visitorSessionImage,
  }) => {
    const checkInImages = visitorSessionImage?.filter((img) =>
      img.imageType.startsWith("CheckIn")
    );

    const checkOutImages = visitorSessionImage?.filter((img) =>
      img.imageType.startsWith("CheckOut")
    );

    return (
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-gray-500 text-sm mb-3">Ảnh ra vào</Text>
        {renderImageSection({ images: checkInImages, title: "Ảnh Vào" })}
        {renderImageSection({ images: checkOutImages, title: "Ảnh Ra" })}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-4">
          Chi tiết phiên ra vào
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Status Card */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-500 text-sm mb-1">Trạng thái</Text>
              <View className="flex-row items-center">
                {sessionData.status === "CheckIn" ? (
                  <MaterialCommunityIcons
                    name="login"
                    size={20}
                    color="#22C55E"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="logout"
                    size={20}
                    color="#EF4444"
                  />
                )}
                <Text className="text-lg font-semibold ml-2">
                  {sessionData.status === "CheckIn" ? "Đã vào" : "Đã ra"}
                </Text>
              </View>
            </View>
            {sessionData.isVehicleSession && (
              <View className="bg-blue-50 px-3 py-1 rounded-full">
                <Text className="text-blue-600 text-sm">Có phương tiện</Text>
              </View>
            )}
          </View>
        </View>

        {/* Time Info */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-500 text-sm mb-3">Thời gian</Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Thời gian vào</Text>
              <Text className="font-medium">
                {new Date(sessionData.checkinTime).toLocaleString()}
              </Text>
            </View>
            {sessionData.checkoutTime && (
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Thời gian ra</Text>
                <Text className="font-medium">
                  {new Date(sessionData.checkoutTime).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Gate Info */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-500 text-sm mb-3">Thông tin cổng</Text>
          <View className="space-y-3">
            {sessionData.gateIn && (
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Cổng vào</Text>
                <Text className="font-medium">
                  {sessionData.gateIn.gateName}
                </Text>
              </View>
            )}
            {sessionData.gateOut && (
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Cổng ra</Text>
                <Text className="font-medium">
                  {sessionData.gateOut.gateName}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Security Info */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-500 text-sm mb-3">Thông tin bảo vệ</Text>
          <View className="space-y-3">
            {sessionData.securityIn && (
              <View>
                <Text className="text-gray-600 mb-1">Bảo vệ vào</Text>
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="shield-account"
                    size={20}
                    color="#9CA3AF"
                  />
                  <Text className="font-medium ml-2">
                    {sessionData.securityIn.fullName}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm ml-7">
                  {sessionData.securityIn.phoneNumber}
                </Text>
              </View>
            )}
            {sessionData.securityOut && (
              <View>
                <Text className="text-gray-600 mb-1">Bảo vệ ra</Text>
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="shield-account"
                    size={20}
                    color="#9CA3AF"
                  />
                  <Text className="font-medium ml-2">
                    {sessionData.securityOut.fullName}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm ml-7">
                  {sessionData.securityOut.phoneNumber}
                </Text>
              </View>
            )}
          </View>
        </View>
        {!isLoadingVisitorSS && !isErrVisitorSS && visitorSessionImage && (
          <VisitorImages visitorSessionImage={visitorSessionImage} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default visitSessionDetail;
