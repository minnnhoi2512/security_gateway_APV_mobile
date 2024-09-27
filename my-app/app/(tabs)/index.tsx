import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Header from "@/components/Header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useGetAllVisitsByCurrentDateQuery } from "@/redux/services/visit.service";
// import calendar_icon from '@/assets/images/calendar.png'

export default function HomeScreen() {
  const { selectedGate } = useLocalSearchParams();
  const router = useRouter();
  const {
    data: visits,
    isLoading,
    isError,
  } = useGetAllVisitsByCurrentDateQuery({
    pageSize: 10,
    pageNumber: 1,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#5163B5" />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500">Error fetching visits!</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header name="Đặng Dương" />
      <View className=" justify-center items-center px-4 mb-[40px]">
        <Image
          source={{
            uri: "https://www.securitymagazine.com/ext/resources/images/security-guard-freepik.jpg?1624490387",
          }}
          style={{ width: 355, height: 190, borderRadius: 25 }}
        />
      </View>
      <ScrollView className="flex-1 bg-[#FAFAFA]">
        <View className="items-center mt-4">
          {selectedGate && (
            <Text className="text-xl text-green-500 font-bold">
              Cổng {selectedGate}
            </Text>
          )}
        </View>
        <View className="p-4">
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-[#d35400]">
                Hôm nay
              </Text>
              <TouchableOpacity>
                <Text className="text-blue-500">Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {visits.map((visit: any) => {
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
                <TouchableOpacity
                  key={visit.visitDetailId}
                  onPress={() => {
                    router.push({
                      pathname: "/VisitDetail",
                      params: {
                        visitDetailId: visit.visitDetailId,
                        id: visit.visitId,
                        visitName: visit.visitName,
                        expectedStartDate: visit.expectedStartDate,
                        expectedEndDate: visit.expectedEndDate,
                        expectedStartTime: visit.expectedStartTime,
                        expectedEndTime: visit.expectedEndTime,
                        visitorName: visit.visitorName,
                      },
                    });
                  }}
                  className="flex-row items-center mb-4 bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <View className="mr-3">
                    <Image
                      source={{
                        uri: "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678116-calendar-512.png",
                      }}
                      style={{ width: 43, height: 44, borderRadius: 25 }}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 font-bold text-base text-[#34495e]">
                      {visit.visitName} - {visit.visitorName}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {formattedStartDate} - {formattedEndDate} -
                       {formattedStartTime} - {formattedEndTime}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
