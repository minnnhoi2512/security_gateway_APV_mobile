import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Header from "@/components/Header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetAllVisitsByCurrentDateQuery } from "@/redux/services/visit.service";
import { Ionicons } from "@expo/vector-icons";
import { Visit2 } from "@/redux/Types/visit.type";

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
    <SafeAreaProvider>
      <View className="flex-1 bg-white">
        <Header name="Đặng Dương" />
        <ScrollView className="flex-1">
          <View className="bg-white py-6">
            {selectedGate && (
              <View className="items-center mb-6">
                <View className="bg-backgroundApp px-6 py-4 rounded-lg shadow-md w-[89%]">
                  <Text className="text-xl text-center text-white font-bold">
                    Cổng {selectedGate}
                  </Text>
                </View>
              </View>
            )}

            <View className="px-4">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-[#3d5a99]">
                  Lịch hẹn hôm nay
                </Text>
                <TouchableOpacity className="bg-buttonColors px-4 py-2 rounded-full">
                  <Text className="text-white font-semibold">Xem tất cả</Text>
                </TouchableOpacity>
              </View>

              {visits && visits.length > 0 ? (
                visits.map((visit: Visit2) => (
                  <TouchableOpacity
                    key={visit.visitId}
                    onPress={() => {
                      router.push({
                        pathname: "/VisitDetail",
                        params: {
                          id: visit.visitId,
                          visitName: visit.visitName,
                          quantity: visit.visitQuantity,
                        },
                      });
                    }}
                    className="mb-4 bg-[#3d5a99] p-4 rounded-xl shadow-lg transition-all duration-300 active:bg-gray-50"
                  >
                    <View className="flex-row items-center p-4 rounded-lg shadow-xl">
                      <View className="mr-4 p-3 bg-white rounded-full">
                        <Ionicons
                          name="calendar-outline"
                          size={30}
                          color="#3d5a99"
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                          <Text
                            className={`font-bold text-lg ${
                              visit.scheduleTypeName === "daily"
                                ? "text-green-600"
                                : "text-white"
                            }`}
                          >
                            {visit.visitName}
                          </Text>
                          <Text className="text-sm font-medium text-white">
                            {visit.scheduleTypeName}
                          </Text>
                        </View>
                        <Text className="text-white mt-1">
                          Số lượng khách: {visit.visitQuantity}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-center text-gray-500 italic">
                  Không có lịch hẹn nào
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaProvider>
  );
}