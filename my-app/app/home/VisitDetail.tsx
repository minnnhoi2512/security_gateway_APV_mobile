import { View, Text, ScrollView, ImageBackground } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
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

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-xl font-semibold text-indigo-600">Loading...</Text>
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
        <ImageBackground
          source={{
            uri: "https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg?cs=srgb&dl=pexels-pixabay-269077.jpg&fm=jpg",
          }}
          className="w-full h-72"
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-black/40" />
        </ImageBackground>
        
        {/* Header Card */}
        {/* <View className="absolute bottom-0 left-0 right-0 translate-y-1/2">
          <View className="  bg-white  shadow-xl">
            <Text className=" my-1 text-3xl font-bold text-blue-700 text-center">
              Chi tiết buổi hẹn
            </Text>
          </View>
        </View> */}
      </View>

      <View className="mt-15 p-4">
        <View className="mb-8">
          <VisitItem visit={visitData}/>
        </View>

        <View className=" bg-gray-50 rounded-3xl shadow-lg p-6 mb-4">
          <Text className="text-2xl font-semibold mb-6 text-blue-700">
            Chi tiết cuộc hẹn
          </Text>

          {visitDetail && visitDetail.length > 0 ? (
            visitDetail.map((visit: VisitDetailType, index: number) => (
              <View
                key={index}
                className="space-y-6 bg-gray-50 rounded-2xl p-6"
              >
                <View className="grid grid-cols-1 gap-y-4">
                  {/* Time Section */}
                  <View className="bg-white rounded-xl p-4 shadow-sm">
                    <View className="flex-row items-center space-x-3">
                      <MaterialIcons
                        name="access-time"
                        size={24}
                        color="#3B82F6"
                      />
                      <View>
                        <Text className="text-sm text-gray-500">Thời gian</Text>
                        <View className="flex-row space-x-2">
                          <Text className="text-base font-medium text-gray-800">
                            {visit.expectedStartHour || "N/A"}
                          </Text>
                          <Text className="text-gray-400">-</Text>
                          <Text className="text-base font-medium text-gray-800">
                            {visit.expectedEndHour || "N/A"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Company Info */}
                  <View className="bg-white rounded-xl p-4 shadow-sm">
                    <View className="flex-row items-center space-x-3">
                      <FontAwesome5
                        name="building"
                        size={24}
                        color="#3B82F6"
                      />
                      <View>
                        <Text className="text-sm text-gray-500">Công ty</Text>
                        <Text className="text-base font-medium text-gray-800">
                          {visit.visitor?.companyName || "N/A"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Visitor Info */}
                  <View className="bg-white rounded-xl p-4 shadow-sm">
                    <View className="flex-row items-center space-x-3">
                      <FontAwesome5
                        name="user"
                        size={24}
                        color="#3B82F6"
                      />
                      <View>
                        <Text className="text-sm text-gray-500">Người tham gia</Text>
                        <Text className="text-base font-medium text-gray-800">
                          {visit.visitor?.visitorName || "N/A"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Phone Info */}
                  <View className="bg-white rounded-xl p-4 shadow-sm">
                    <View className="flex-row items-center space-x-3">
                      <FontAwesome5
                        name="phone"
                        size={24}
                        color="#3B82F6"
                      />
                      <View>
                        <Text className="text-sm text-gray-500">Số điện thoại</Text>
                        <Text className="text-base font-medium text-gray-800">
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