import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Header from "@/components/UI/Header";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetVisitsByCurrentDateQuery } from "@/redux/services/visit.service";
import { FontAwesome5 } from "@expo/vector-icons";
import { Visit2 } from "@/redux/Types/visit.type";
import VisitItem from "../home/VisitItem";
import StaffCard from "../home/StaffCard";
import { useGetAllStaffQuery } from "@/redux/services/user.service";
import { Staff } from "@/Types/user.type";
import AddButton from "@/components/UI/AddButton";
import { useGetVisitorSessionsQuery } from "@/redux/services/visitorSession.service";

export default function HomeScreen() {
  const { selectedGate } = useLocalSearchParams();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState("Active"); // State to manage the current status

  const {
    data: visits,
    isLoading,
    isError,
    refetch,
  } = useGetVisitsByCurrentDateQuery(
    { pageSize: -1, pageNumber: 1 },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const {
    data: staffList,
    isLoading: isLoadingStaff,
    isError: isErrorStaff,
  } = useGetAllStaffQuery({});

  useEffect(() => {
    if (visits && visits.length === 0) {
      refetch();
    }
  }, [visits, refetch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const renderEmptyState = () => (
    <View className="bg-white p-8 rounded-xl border border-gray-100 items-center">
      <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
        <FontAwesome5 name="calendar-times" size={24} color="#9CA3AF" />
      </View>
      <Text className="text-gray-400 text-center">Không có lịch hẹn nào.</Text>
    </View>
  );

  const renderVisitItem = ({ item }: { item: Visit2 }) => (
    <View className="mb-2">
      <VisitItem visit={item} />
    </View>
  );

  const filteredVisits = visits?.filter(
    (visit: any) => visit.visitStatus === status
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#5163B5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-gray-50">
        <Header name="Đặng Dương" />

        <FlatList
          ListHeaderComponent={
            <>
              <View className="mb-6 mt-5">
                <View className="px-6 mb-4 flex-row justify-between items-center">
                  <Text className="text-xl font-bold text-[#d35400]">
                    Nhân viên trực
                  </Text>
                </View>

                <View className="px-6">
                  <FlatList
                    horizontal
                    data={staffList}
                    renderItem={({ item }) => <StaffCard staff={item} />}
                    keyExtractor={(staff) => staff.userId}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
              </View>

              <View className="px-4">
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-xl ml-2 font-bold text-[#d35400]">
                    Chuyến thăm hôm nay
                  </Text>

                  <View className="bg-emerald-100 px-4 py-2 rounded-full flex-row items-center space-x-2">
                    <FontAwesome5
                      name="calendar-check"
                      size={18}
                      color="#059669"
                    />
                    <Text className="text-emerald-700 font-semibold">
                      {filteredVisits?.length || 0} chuyến thăm
                    </Text>
                  </View>
                </View>
                {/* <View className="flex-row justify-evenly items-center mb-4">
                  <Text className="text-3xl font-bold text-[#d35400] flex-shrink">
                    Chuyến thăm Hôm nay
                  </Text>

                  <View className="bg-emerald-100 px-2 py-1 rounded-full flex-row items-center space-x-1.5 mb-6">
                    <FontAwesome5
                      name="calendar-check"
                      size={16}
                      color="#059669"
                    />
                    <Text className="text-emerald-700 font-semibold text-sm">
                      {filteredVisits?.length || 0} chuyến thăm
                    </Text>
                  </View>
                </View> */}
              </View>
              {/* <View className="gap-2 px-2 mb-4 flex-row justify-between">
                <TouchableOpacity
                  onPress={() => setStatus("Active")}
                  className={`px-4 py-2 rounded-full ${
                    status === "Active" ? "bg-blue-500" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      status === "Active" ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Hoạt động
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStatus("ActiveTemporary")}
                  className={`px-4 py-2 rounded-full ${
                    status === "ActiveTemporary"
                      ? "bg-yellow-500"
                      : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      status === "ActiveTemporary"
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    Tạm thời
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStatus("Violation")}
                  className={`px-4 py-2 rounded-full ${
                    status === "Violation" ? "bg-red-500" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      status === "Violation" ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Vi phạm
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStatus("ViolationResolved")}
                  className={`px-4 py-2 rounded-full ${
                    status === "ViolationResolved"
                      ? "bg-gray-500"
                      : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      status === "ViolationResolved"
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    Đã xử lí
                  </Text>
                </TouchableOpacity>
              </View> */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-2 mb-4"
              >
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setStatus("Active")}
                    className={`px-4 py-2 rounded-full ${
                      status === "Active" ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        status === "Active" ? "text-white" : "text-gray-700"
                      }`}
                    >
                      Hoạt động
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setStatus("ActiveTemporary")}
                    className={`px-4 py-2 rounded-full ${
                      status === "ActiveTemporary"
                        ? "bg-yellow-500"
                        : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        status === "ActiveTemporary"
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      Tạm thời
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setStatus("Violation")}
                    className={`px-4 py-2 rounded-full ${
                      status === "Violation" ? "bg-red-500" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        status === "Violation" ? "text-white" : "text-gray-700"
                      }`}
                    >
                      Vi phạm
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setStatus("ViolationResolved")}
                    className={`px-4 py-2 rounded-full ${
                      status === "ViolationResolved"
                        ? "bg-gray-500"
                        : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        status === "ViolationResolved"
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      Đã xử lí
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </>
          }
          data={filteredVisits}
          renderItem={renderVisitItem}
          keyExtractor={(visit) => visit.visitId.toString()}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
        />

        <AddButton />
      </View>
    </SafeAreaProvider>
  );
}
