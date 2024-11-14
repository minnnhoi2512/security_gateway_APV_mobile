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
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
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
  const handleGoBack = () => {
    router.back();
  };

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const getTimeStatusIcon = (expectedStartHour: string) => {
    const now = new Date();
    const startHour = new Date();
    const [hour, minute] = expectedStartHour.split(':').map(Number);
    startHour.setHours(hour, minute, 0, 0);

    if (startHour > now) {
      return <Ionicons name="notifications" size={24}  color="#1abc9c" />;
    } else {
      return <MaterialIcons  name="notifications-on" size={24} color="red" />;
    }
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

        <View className=" p-4 bottom-16">
          <View className="mb-8">
            <VisitItemDetail visit={visitData} />
          </View>

          <View className="bg-gray-50 rounded-3xl mb-4">
            <Text className="text-2xl font-semibold mb-6 text-[#34495e]">
              Chi tiết cuộc hẹn
            </Text>

            {visitDetail && visitDetail.length > 0 ? (
              visitDetail.map((visit: VisitDetailType, index: number) => (
                <View
                  key={index}
                  // className="bg-white rounded-3xl p-4 shadow-md mb-4"
                >
                  <TouchableOpacity
                    onPress={toggleExpansion}
                    className="bg-white rounded-2xl shadow-md mb-4"
                  >
                    <View className="flex-row items-center justify-between p-4">
                      <View className="flex-row items-center space-x-3">
                        <Ionicons
                          name="time-outline"
                          size={25}
                          color="#1abc9c"
                        />
                        {/* <FontAwesome5
                          name="calendar-check"
                          size={20}
                          color="#e67e22"
                        /> */}
                        <View>
                          <Text className="text-xs text-gray-400">
                            Thời gian
                          </Text>
                          <Text className="text-sm font-medium text-gray-800">
                            {visit.expectedStartHour} - {visit.expectedEndHour}
                          </Text>
                        </View>
                        {getTimeStatusIcon(visit.expectedStartHour)}
                      </View>
                      <FontAwesome5
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#1abc9c"
                      />
                      
                    </View>

                    {isExpanded && (
                      <View className="px-4 pb-4">
                        <View className="bg-white rounded-2xl p-4  ">
                          <View className="flex-row items-center space-x-3">
                            <FontAwesome5
                              name="user"
                              size={20}
                              color="#1abc9c"
                            />
                            <View>
                              <Text className="text-xs text-gray-500">
                                Khách hàng
                              </Text>
                              <Text className="text-sm font-medium text-gray-800">
                                {visit.visitor?.visitorName || "N/A"}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View className="bg-white rounded-2xl p-4   mt-2">
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
                        </View>

                        <View className="bg-white rounded-2xl p-4 mt-2">
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
                      </View>
                    )}
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
