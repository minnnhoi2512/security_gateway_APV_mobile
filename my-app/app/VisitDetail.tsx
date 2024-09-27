import { View, Text, ScrollView, ImageBackground } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useGetVisitDetailByIdQuery } from "@/redux/services/visit.service";
import { VisitDetailType } from "@/redux/Types/visit.type";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const VisitDetail = () => {
  const { id } = useLocalSearchParams();

  const {
    data: visitDetail,
    isLoading,
    isError,
  } = useGetVisitDetailByIdQuery(id as string);

  console.log("id: ", id);
  console.log("datra: ", visitDetail);

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
    <ScrollView className="bg-gray-100">
      <ImageBackground
        source={{
          uri: "https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg?cs=srgb&dl=pexels-pixabay-269077.jpg&fm=jpg",
        }}
        className="w-full h-64 justify-end"
        resizeMode="cover"
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          className="w-full h-32 justify-end p-4"
        >
          <Text className="text-4xl font-bold text-white">Visit Detail</Text>
        </LinearGradient>
      </ImageBackground>

      <View className="p-4">
        <LinearGradient
          colors={["#4c669f", "#3b5998", "#192f6a"]}
          className="p-4 rounded-xl shadow-lg mb-6"
        >
          <View className="flex-row items-center mb-3">
            <FontAwesome5
              name="calendar-alt"
              size={24}
              color="#FFFFFF"
              style={{ marginRight: 12 }}
            />
            <Text className="text-lg text-white">
              Ngày đăng ký:{" "}
              {new Date(visitDetail?.dateRegister).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row items-center">
            <FontAwesome5
              name="users"
              size={24}
              color="#FFFFFF"
              style={{ marginRight: 12 }}
            />
            <Text className="text-lg text-white">
              Số lượng khách: {visitDetail?.visitQuantity}
            </Text>
          </View>
        </LinearGradient>

        <Text className="text-2xl font-semibold mb-4 text-[#2e4053]">
          Chi tiết cuộc thăm
        </Text>

        {visitDetail?.visitDetail.map(
          (visit: VisitDetailType, index: number) => {
            const formattedStartDate = visit.expectedStartDate.split("T")[0];
            const formattedEndDate = visit.expectedEndDate.split("T")[0];
            const formattedStartTime = visit.expectedStartTime
              .split(":")
              .slice(0, 2)
              .join(":");
            const formattedEndTime = visit.expectedEndTime
              .split(":")
              .slice(0, 2)
              .join(":");

            return (
              <LinearGradient
                key={index}
                colors={["#ffffff", "#f0f0f0"]}
                className="p-6 rounded-xl shadow-md mb-4"
              >
                <Text className="text-2xl font-semibold mb-3 text-indigo-800">
                  {visit.visitDetailName}
                </Text>
                <View className="space-y-3">
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="access-time"
                      size={24}
                      color="#4c669f"
                      style={{ marginRight: 12 }}
                    />
                    <Text className="text-lg text-gray-800">
                      Bắt đầu: {formattedStartDate} {formattedStartTime}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="access-time"
                      size={24}
                      color="#4c669f"
                      style={{ marginRight: 12 }}
                    />
                    <Text className="text-lg text-gray-800">
                      Kết thúc: {formattedEndDate} {formattedEndTime}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <FontAwesome5
                      name="building"
                      size={24}
                      color="#4c669f"
                      style={{ marginRight: 12 }}
                    />
                    <Text className="text-lg text-gray-800">
                      Công ty: {visit.visitor.companyName}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <FontAwesome5
                      name="user"
                      size={24}
                      color="#4c669f"
                      style={{ marginRight: 12 }}
                    />
                    <Text className="text-lg text-gray-800">
                      Người tham gia: {visit.visitor.visitorName}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <FontAwesome5
                      name="phone"
                      size={24}
                      color="#4c669f"
                      style={{ marginRight: 12 }}
                    />
                    <Text className="text-lg text-gray-800">
                      Số điện thoại: {visit.visitor.phoneNumber}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            );
          }
        )}
      </View>
    </ScrollView>
  );
};

export default VisitDetail;
