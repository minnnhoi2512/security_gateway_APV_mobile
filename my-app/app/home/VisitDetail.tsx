import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Pressable,
} from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetVisitDetailByIdQuery } from "@/redux/services/visit.service";
import { VisitDetailType } from "@/redux/Types/visit.type";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import VisitItem from "./VisitItem";

const VisitDetail = () => {
  const { data } = useLocalSearchParams();
  const visitData = data ? JSON.parse(data.toString()) : null;

  const {
    data: visitDetail,
    isLoading,
    isError,
  } = useGetVisitDetailByIdQuery(visitData.visitId as string);
  const router = useRouter();
  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-xl font-semibold text-indigo-600">
          Loading...
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
          className="absolute top-6 left-2 flex flex-row items-center space-x-2 px-4 py-2 rounded-lg mt-4  z-10"
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
          <Text className="text-white font-medium">Quay về</Text>
        </Pressable>

  
        <ImageBackground
          source={{
            uri: "https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg?cs=srgb&dl=pexels-pixabay-269077.jpg&fm=jpg",
          }}
          className="w-full h-72"
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-black/40" />
        </ImageBackground>
 
      </View>

      <View className="mt-15 p-4">
        <View className="mb-8">
          <VisitItem visit={visitData} />
        </View>

        <View className="bg-gray-50 rounded-3xl mb-4">
          <Text className="text-2xl font-semibold mb-6 text-blue-700">
            Chi tiết cuộc hẹn
          </Text>

          {visitDetail && visitDetail.length > 0 ? (
            visitDetail.map((visit: VisitDetailType, index: number) => (
              <View
                key={index}
                className="bg-white rounded-3xl p-4 shadow-md mb-4"
              >
                <View className="grid grid-cols-1 gap-y-4">
                  <View className="bg-white rounded-2xl p-4 shadow-sm">
                    <View className="flex-row items-center space-x-3">
                      <MaterialIcons
                        name="access-time"
                        size={20}
                        color="#3B82F6"
                      />
                      <View>
                        <Text className="text-xs text-gray-500">Thời gian</Text>
                        <View className="flex-row space-x-2">
                          <Text className="text-sm font-medium text-gray-800">
                            {visit.expectedStartHour || "N/A"}
                          </Text>
                          <Text className="text-gray-400">-</Text>
                          <Text className="text-sm font-medium text-gray-800">
                            {visit.expectedEndHour || "N/A"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="bg-white rounded-2xl p-4 shadow-sm">
                    <View className="flex-row items-center space-x-3">
                      <FontAwesome5 name="building" size={20} color="#3B82F6" />
                      <View>
                        <Text className="text-xs text-gray-500">Công ty</Text>
                        <Text className="text-sm font-medium text-gray-800">
                          {visit.visitor?.companyName || "N/A"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-white rounded-2xl p-4 shadow-sm">
                    <View className="flex-row items-center space-x-3">
                      <FontAwesome5 name="user" size={20} color="#3B82F6" />
                      <View>
                        <Text className="text-xs text-gray-500">
                          Người tham gia
                        </Text>
                        <Text className="text-sm font-medium text-gray-800">
                          {visit.visitor?.visitorName || "N/A"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-white rounded-2xl p-4 shadow-sm">
                    <View className="flex-row items-center space-x-3">
                      <FontAwesome5 name="phone" size={20} color="#3B82F6" />
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
                </View>
              </View>
            ))
          ) : (
            <Text className="text-lg text-gray-600 text-center italic">
              Không có thông tin chi tiết.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default VisitDetail;
