import {
  View,
  Text,
  StatusBar,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Header from "@/components/UI/Header";
import { useGetAllVisitsByCurrentDateQuery } from "@/redux/services/visit.service";
import { Visit2 } from "@/redux/Types/visit.type";
import VisitItem from "../home/VisitItem";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const visitForStaff = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState("Active"); // State to manage the current status

  const {
    data: visits,
    isLoading,
    isError,
    refetch,
  } = useGetAllVisitsByCurrentDateQuery({
    pageSize: -1,
    pageNumber: 1,
  });
  const redirectToAddVisitPageHandler = () => {
    router.push("/createVisitForStaff/createVisitDailyLayout");
  };

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
      <Text className="text-gray-400 text-center">
        Không có lịch hẹn nào cho hôm nay
      </Text>
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
  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-gray-50">
        <Header name="Đặng Dương" />

        <FlatList
          ListHeaderComponent={
            <>
              <View className="mt-8">
                <View className="flex-row justify-evenly items-center mb-4">
                  <Text className="text-lg font-bold text-[#d35400] flex-shrink">
                    Chuyến thăm Hôm nay
                  </Text>

                  <View className="bg-emerald-100 px-2 py-1 rounded-full flex-row items-center space-x-1.5">
                    <Text className="text-emerald-700 font-semibold text-sm">
                      {filteredVisits?.length || 0}
                    </Text>
                    <FontAwesome5
                      name="calendar-check"
                      size={16}
                      color="#059669"
                    />
                  </View>
                </View>
                {/* <View className="mr-2 gap-2 mb-4 flex-row">
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
                  className="mb-4"
                >
                  <View className="mr-2 flex-row gap-2">
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
                          status === "Violation"
                            ? "text-white"
                            : "text-gray-700"
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
              </View>
            </>
          }
          data={filteredVisits}
          renderItem={renderVisitItem}
          keyExtractor={(visit) => visit.visitId.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity
          className="bg-[#34495e] w-16 h-16 absolute bottom-32 right-5 rounded-full justify-center items-center"
          onPress={redirectToAddVisitPageHandler}
        >
          <Ionicons name="add-outline" size={25} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
};

export default visitForStaff;
