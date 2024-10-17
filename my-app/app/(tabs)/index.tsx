import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Header from "@/components/UI/Header";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetAllVisitsByCurrentDateQuery } from "@/redux/services/visit.service";
import { Ionicons } from "@expo/vector-icons";
import { Visit2 } from "@/redux/Types/visit.type";
import VisitItem from "../home/VisitItem";
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
                <TouchableOpacity className="bg-buttonGreen px-4 py-2 rounded-full">
                  <Text className="text-white font-semibold">Xem tất cả</Text>
                </TouchableOpacity>
              </View>

              {visits && visits.length > 0 ? (
                visits.map((visit: Visit2) => (
                  <View className="py-2">
                    <VisitItem key={visit.visitId} visit={visit} />
                  </View>
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