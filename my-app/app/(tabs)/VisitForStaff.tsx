import {
  View,
  Text,
  StatusBar,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Header from "@/components/UI/Header";
import { useGetAllVisitsByCurrentDateQuery } from "@/redux/services/visit.service";
import { Visit2 } from "@/redux/Types/visit.type";
import VisitItem from "../home/VisitItem";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const visitForStaff = () => {
  const router = useRouter();
  const {
    data: visits,
    isLoading,
    isError,
  } = useGetAllVisitsByCurrentDateQuery({
    pageSize: 10,
    pageNumber: 1,
  });
  const redirectToAddVisitPageHandler = () => {
    router.push("/createVisitForStaff/createVisitDailyLayout");
  };

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

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-gray-50">
        <Header name="Đặng Dương" />

        <FlatList
          ListHeaderComponent={
            <>
              <View className="px-6 mt-8">
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-xl  font-bold text-[#d35400]">
                    Lịch hẹn Hôm nay
                  </Text>
                  <View className="bg-emerald-100 px-4 py-2 rounded-full flex-row items-center space-x-2">
                    <FontAwesome5
                      name="calendar-check"
                      size={18}
                      color="#059669"
                    />
                    <Text className="text-emerald-700 font-semibold">
                      {visits?.length || 0} lịch hẹn
                    </Text>
                  </View>
                </View>
              </View>
            </>
          }
          data={visits}
          renderItem={renderVisitItem}
          keyExtractor={(visit) => visit.visitId.toString()}
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
