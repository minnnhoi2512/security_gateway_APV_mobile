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
import { useGetAllVisitsByCurrentDateQuery } from "@/redux/services/visit.service";
import { Ionicons } from "@expo/vector-icons";
import { Visit2 } from "@/redux/Types/visit.type";
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header name="Đặng Dương" />
      <ScrollView className="flex-1">
        <View className="justify-center items-center px-4 mb-8">
          <Image
            source={{
              uri: "https://www.securitymagazine.com/ext/resources/images/security-guard-freepik.jpg?1624490387",
            }}
            className="w-full h-48 rounded-2xl shadow-lg"
          />
        </View>

        {selectedGate && (
          <View className="items-center mb-6">
            <View className="bg-green-500 px-6 py-2 rounded-full shadow-md">
              <Text className="text-xl text-white font-bold">
                Cổng {selectedGate}
              </Text>
            </View>
          </View>
        )}

        <View className="px-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">Hôm nay</Text>
            <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-full">
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
                    
                    params: { id: visit.visitId, visitName: visit.visitName, quantity: visit.visitQuantity },
                  });
                }}
                className="mb-4 bg-white p-4 rounded-xl shadow-md border border-gray-100 transition-all duration-300 active:bg-gray-50"
              >
                <View className="flex-row items-center">
                  <View className="mr-4 bg-indigo-100 p-3 rounded-full">
                  <Image
                        source={{
                          uri: "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678116-calendar-512.png",
                        }}
                        style={{ width: 33, height: 34, borderRadius: 25 }}
                      />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`font-bold text-lg ${
                          visit.scheduleTypeName === "daily"
                            ? "text-green-600"
                            : "text-gray-800"
                        }`}
                      >
                        {visit.visitName}
                      </Text>
                      <Text className="text-sm font-medium text-green-500">
                        {visit.scheduleTypeName}
                      </Text>
                    </View>
                    <Text className="text-gray-600 mt-1">
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
      </ScrollView>
    </SafeAreaView>
  );
}
