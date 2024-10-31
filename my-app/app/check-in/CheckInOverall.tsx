import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

type Data = {
  visitDetailId: number;
  securityInId: number;
  gateInId: number;
  sessionsImageRes: {
    checkinTime: string;
    securityInId: number;
    gateInId: number;
    images: Array<{
      imageType: string;
      imageURL: string;
      image: null | any;
    }>;
  };
  card: {
    cardId: number;
    cardVerification: string;
    createDate: string;
    lastCancelDate: string;
    cardImage: string;
    cardStatus: string;
    qrCardTypename: null | string;
  };
  detectShoeRes: {
    label: string;
    confidence: number;
  };
};

const CheckInOverall = () => {
  const { data } = useLocalSearchParams();
  const [parsedData, setParsedData] = React.useState<Data | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    try {
      if (typeof data === "string") {
        let cleanedDataString = data
          .replace(/\\"/g, '"')
          .replace(/"\?/g, "?")
          .replace(/&token=[^"]+"/g, '"');

        const parsedObj = JSON.parse(cleanedDataString);

        // const processImageUrls = (obj: any): any => {
        //   if (!obj || typeof obj !== 'object') return obj;

        //   if (Array.isArray(obj)) {
        //     return obj.map(item => processImageUrls(item));
        //   }

        //   const processed: any = {};
        //   for (const [key, value] of Object.entries(obj)) {
        //     if (key === 'imageURL' && typeof value === 'string') {
        //       const baseUrl = value.split('?')[0];
        //       processed[key] = `${baseUrl}?alt=media`;
        //     } else {
        //       processed[key] = processImageUrls(value);
        //     }
        //   }
        //   return processed;
        // };
        const processImageUrls = (obj: any): any => {
          if (!obj || typeof obj !== "object") return obj;

          if (Array.isArray(obj)) {
            return obj.map((item) => processImageUrls(item));
          }

          const processed: any = {};
          for (const [key, value] of Object.entries(obj)) {
            if (key === "imageURL" && typeof value === "string") {
              // Keep the imageURL as-is without modification
              processed[key] = value;
            } else {
              processed[key] = processImageUrls(value);
            }
          }
          return processed;
        };
        const processedData = processImageUrls(parsedObj);
        setParsedData(processedData);
      }
    } catch (error) {
      console.error("Error parsing data:", error);
      if (typeof data === "string") {
        console.log("Raw data string:", data);
      }
    }
  }, [data]);

  const handleNext = () => {
    router.push("/(tabs)/checkin");
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  if (!parsedData) {
    return (
      <View className="flex-1 justify-center items-center bg-backgroundApp">
        <Text className="text-gray-600">Đang tải...</Text>
      </View>
    );
  }
  console.log("Image URL:", parsedData.sessionsImageRes.images);
  return (
    <ScrollView className="flex-1 bg-backgroundApp">
      <View className="p-4 space-y-4">
        {/* Header */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mt-[80px]">
          <Text className="text-2xl font-bold text-gray-800">
            Thông tin check in
          </Text>
        </View>

        {/* Basic Info Section */}
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center space-x-2 mb-4">
            <View className="w-1 h-6 bg-blue-500 rounded-full" />
            <Text className="text-lg font-semibold text-gray-800">
              Thông tin cơ bản
            </Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Mã chuyến thăm</Text>
              <Text className="font-medium text-gray-800">
                {parsedData.visitDetailId}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Mã bảo vệ</Text>
              <Text className="font-medium text-gray-800">
                {parsedData.securityInId}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Cổng </Text>
              <Text className="font-medium text-gray-800">
                {parsedData.gateInId}
              </Text>
            </View>
          </View>
        </View>

        {/* Session Information */}
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center space-x-2 mb-4">
            <View className="w-1 h-6 bg-green-500 rounded-full" />
            <Text className="text-lg font-semibold text-gray-800">
              Thông tin phiên thăm
            </Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Thời gian check in</Text>
              <Text className="font-medium text-gray-800">
                {formatDate(parsedData.sessionsImageRes.checkinTime)}
              </Text>
            </View>
            {/* <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Security In ID</Text>
              <Text className="font-medium text-gray-800">
                {parsedData.sessionsImageRes.securityInId}
              </Text>
            </View> */}
            {/* <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Gate In ID</Text>
              <Text className="font-medium text-gray-800">
                {parsedData.sessionsImageRes.gateInId}
              </Text>
            </View> */}
          </View>
          <View className="mt-4 space-y-4">
            {parsedData.sessionsImageRes.images.map((img, index) => (
              <View key={index} className="bg-gray-50 rounded-xl p-3">
                <Text className="text-gray-600 mb-2">
                  Loại ảnh: {img.imageType}
                </Text>
                {img.imageURL ? (
                  <Image
                    source={{ uri: img.imageURL }}
                    className="w-full h-48 rounded-xl"
                    resizeMode="cover"
                    // onError={() =>
                    //   console.error("Failed to load image:", img.imageURL)
                      
                    // }
                  />
                ) : (
                  <Text>Hình ảnh không có sẵn..</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Card Information */}
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center space-x-2 mb-4">
            <View className="w-1 h-6 bg-purple-500 rounded-full" />
            <Text className="text-lg font-semibold text-gray-800">
              Thông tin thẻ
            </Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Thứ tự</Text>
              <Text className="font-medium text-gray-800">
                {parsedData.card.cardId}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Mã thẻ</Text>
              <Text className="font-medium text-gray-800">
                {parsedData.card.cardVerification}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Trạng thái</Text>
              <Text className="font-medium text-green-600">
                {parsedData.card.cardStatus}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Thời gian tạo chuyến thăm</Text>
              <Text className="font-medium text-gray-800">
                {formatDate(parsedData.card.createDate)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Thời gian thay đổi</Text>
              <Text className="font-medium text-gray-800">
                {formatDate(parsedData.card.lastCancelDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Detection Results */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <View className="flex-row items-center space-x-2 mb-4">
            <View className="w-1 h-6 bg-orange-500 rounded-full" />
            <Text className="text-lg font-semibold text-gray-800">
              Kết quả kiểm tra
            </Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Nhãn</Text>
              <Text className="font-medium text-gray-800">
                {parsedData.detectShoeRes.label}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Độ chính xác </Text>
              <Text className="font-medium text-green-600">
                {parsedData.detectShoeRes.confidence}%
              </Text>
            </View>
          </View>
        </View>
        <View className="bg-white p-4 mb-3 rounded-md">
          <TouchableOpacity onPress={handleNext}>
            <Text className="text-center text-xl">Đồng ý</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default CheckInOverall;
