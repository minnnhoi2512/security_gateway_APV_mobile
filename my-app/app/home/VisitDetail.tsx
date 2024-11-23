import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetVisitDetailByIdQuery } from "@/redux/services/visit.service";
import { VisitDetailType } from "@/redux/Types/visit.type";
import {
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import VisitItemDetail from "./VisitItemDetail";

const VisitDetail = () => {
  const { data } = useLocalSearchParams();
  const visitData = data ? JSON.parse(data.toString()) : null;
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    data: visitDetail,
    isLoading,
    isError,
  } = useGetVisitDetailByIdQuery(visitData.visitId as string);
  const router = useRouter();
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const handleGoBack = () => {
    router.back();
  };

  const toggleExpansion = (index: number) => {
    setExpandedItem((prev) => (prev === index ? null : index));
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-xl font-semibold text-backgroundApp">
          Đang tải...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-xl font-semibold text-red-500">
          Error fetching visit details.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-gray-50">
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
            <VisitItemDetail visit={visitData} />
          </View>

          <View className="bg-gray-50 rounded-3xl mb-4">
            <Text className="text-2xl font-semibold mb-6 text-[#34495e]">
              Thông tin khách hàng
            </Text>

            {visitDetail && visitDetail.length > 0 ? (
              visitDetail.map((visit: VisitDetailType, index: number) => (
                <View key={index}>
                  <TouchableOpacity
                    onPress={() => toggleExpansion(index)}
                    className="bg-white rounded-2xl shadow-md mb-4"
                  >
                    <View className="p-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center space-x-3">
                          <FontAwesome name="user" size={24} color="#1abc9c" />
                          <View>
                            <Text className="text-sm font-medium text-gray-800">
                              {visit.visitor?.visitorName}
                            </Text>
                            <Text className="text-xs text-gray-400">
                              {visit.expectedStartHour
                                ?.split(":")
                                .slice(0, 2)
                                .join(":")}{" "}
                              -{" "}
                              {visit.expectedEndHour
                                ?.split(":")
                                .slice(0, 2)
                                .join(":")}
                            </Text>
                          </View>
                          <View
                            style={{
                              backgroundColor:
                                visit.sessionStatus === "CheckIn"
                                  ? "#abebc6"
                                  : visit.sessionStatus === "CheckOut"
                                  ? "#fadbd8"
                                  : "#e5e8e8",
                              paddingHorizontal: 12,
                              paddingVertical: 4,
                              borderRadius: 16,
                              marginBottom: 16,
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  visit.sessionStatus === "CheckIn"
                                    ? "#2ecc71"
                                    : visit.sessionStatus === "CheckOut"
                                    ? "#e74c3c"
                                    : "#85929e",
                                fontSize: 12,
                                fontWeight: "500",
                              }}
                            >
                              {visit.sessionStatus === "CheckIn"
                                ? "Đã vào"
                                : visit.sessionStatus === "CheckOut"
                                ? "Đã ra"
                                : "Chưa vào"}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-center space-x-2">
                          <FontAwesome5
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#1abc9c"
                          />
                        </View>
                      </View>

                      {expandedItem === index && (
                        <View className="mt-4 space-y-3">
                          <View className="flex-row items-center space-x-3">
                            <FontAwesome5
                              name="building"
                              size={20}
                              color="#1abc9c"
                            />
                            <View>
                              <Text className="text-xs text-gray-500">
                                Công ty
                              </Text>
                              <Text className="text-sm font-medium text-gray-800">
                                {visit.visitor?.companyName || "N/A"}
                              </Text>
                            </View>
                          </View>

                          <View className="flex-row items-center space-x-3">
                            <FontAwesome5
                              name="phone"
                              size={20}
                              color="#1abc9c"
                            />
                            <View>
                              <Text className="text-xs text-gray-500">
                                Số điện thoại
                              </Text>
                              <Text className="text-sm font-medium text-gray-800">
                                {visit.visitor?.phoneNumber || "N/A"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text className="text-lg text-gray-600 text-center italic">
                Không có thông tin chi tiết.
              </Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default VisitDetail;
