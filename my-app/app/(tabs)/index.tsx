import React, { useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Header from "@/components/UI/Header";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetAllVisitsByCurrentDateQuery } from "@/redux/services/visit.service";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Visit2 } from "@/redux/Types/visit.type";
import VisitItem from "../home/VisitItem";
import StaffCard from "../home/StaffCard";
import { useGetAllStaffQuery } from "@/redux/services/user.service";
import { Staff } from "@/Types/user.type";
import AddButton from "@/components/UI/AddButton";
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

  const {
    data: staffList,
    isLoading: isLoadingStaff,
    isError: isErrorStaff,
    isFetching: isFetchingStaff,
  } = useGetAllStaffQuery({});

  // const {
  //   data: visits,
  //   isLoading,
  //   isError,
  //   refetch,
  // } = useGetAllVisitsByCurrentDateQuery(
  //   { pageSize: 10, pageNumber: 1 },
  //   {
  //     refetchOnMountOrArgChange: true,
  //   }
  // );

  // useEffect(() => {
  //   if (visits && visits.length === 0) {
  //     refetch();
  //   }
  // }, [refetch, visits]);

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

  // console.log("staff home: ", staffList);

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-gray-50">
        <Header name="Đặng Dương" />

        <ScrollView className="flex-1 pt-4">
          <View className="mb-6">
            <View className="px-6 mb-4 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-800">
                Nhân viên trực
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-6"
            >
              {staffList?.map((staff: Staff) => (
                <StaffCard key={staff.userId} staff={staff} />
              ))}
            </ScrollView>
          </View>

          <View className="px-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Lịch hẹn Hôm nay
              </Text>
              <View className="bg-emerald-100 px-4 py-2 rounded-full flex-row items-center space-x-2">
                <FontAwesome5 name="calendar-check" size={18} color="#059669" />
                <Text className="text-emerald-700 font-semibold">
                  {visits?.length || 0} lịch hẹn
                </Text>
              </View>
            </View>

            {visits && visits.length > 0 ? (
              visits.map((visit: Visit2) => (
                <View key={visit.visitId}>
                  <VisitItem visit={visit} />
                </View>
              ))
            ) : (
              <View className="bg-white p-8 rounded-xl border border-gray-100 items-center">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <FontAwesome5
                    name="calendar-times"
                    size={24}
                    color="#9CA3AF"
                  />
                </View>
                <Text className="text-gray-400 text-center">
                  Không có lịch hẹn nào cho hôm nay
                </Text>
              </View>
            )}
              
          </View>
        
        </ScrollView>
        <AddButton />
      </View>
    </SafeAreaProvider>
  );
}
