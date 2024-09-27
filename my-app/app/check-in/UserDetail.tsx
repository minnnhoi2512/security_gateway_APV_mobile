import { View, Text, Image, SafeAreaView, ScrollView } from "react-native";
import React from "react";
import {
  GestureHandlerRootView,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetVisitByCredentialCardQuery } from "@/redux/services/visit.service";

interface ScanData {
  id: string;
  nationalId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  issueDate: string;
}

const UserDetail = () => {
  const { data } = useLocalSearchParams<{ data: string }>();
  console.log("DATA: ", data);
  const router = useRouter();
  let credentialCardId: string | null = null;
  const parseQRData = (qrData: string): ScanData => {
    const [id, nationalId, name, dateOfBirth, gender, address, issueDate] =
      qrData.split("|");
      credentialCardId= id;
    return { id, nationalId, name, dateOfBirth, gender, address, issueDate };
  };

  const userData: ScanData | null = data ? parseQRData(data) : null;

  const {
    data: visitUser,
    isLoading,
    isError,
  } = credentialCardId ? useGetVisitByCredentialCardQuery(credentialCardId) : { data: null, isLoading: false, isError: true }

  console.log("dataa cs: ", visitUser);
  

  if (!userData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-xl font-bold text-gray-800">
          Không có dữ liệu người dùng
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
    <ScrollView>
      <GestureHandlerRootView className="flex-1 p-5">
        <View className="bg-[#6255fa] rounded-3xl p-6 mb-6 shadow-lg">
          <Text className="text-3xl font-bold text-white text-center mb-4">
            {userData.name}
          </Text>
          <View className="flex-row justify-between mb-4">
            <View className="flex-row items-center">
              <Feather name="credit-card" size={18} color="white" />
              <Text className="text-white ml-2">CCCD: {userData.id}</Text>
            </View>
          </View>
          <View className="flex-row items-center mb-2">
            <Feather name="calendar" size={18} color="white" />
            <Text className="text-white ml-2">Ngày sinh: {userData.dateOfBirth}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Feather name="user" size={18} color="white" />
            <Text className="text-white ml-2">Giới tính: {userData.gender}</Text>
          </View>
          <View className="flex-row items-center mb-4">
            <Feather name="map-pin" size={18} color="white" />
            <Text className="text-white ml-2 text-base">{userData.address}</Text>
          </View>
          <View className="flex-row items-center mb-4">
            <Feather name="calendar" size={18} color="white" />
            <Text className="text-white ml-2 text-base">Ngày cấp: {userData.issueDate}</Text>
          </View>
          <TouchableOpacity onPress={() => {
                     if (visitUser && visitUser.visitId) { 
                      router.push({
                        pathname: "/VisitDetail",
                        params: { id: visitUser.visitId }, 
                      });
                    }
                  }} className="bg-white rounded-lg py-3 px-4 shadow-md">
            <Text className="text-[#6255fa] text-lg font-semibold text-center">
              Xem chi tiết lịch hẹn
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xl font-bold text-gray-800 mb-4">Hình ảnh gần đây</Text>
        <View className="flex-row justify-between mb-6">
          <Image
            className="w-[160px] h-[160px] rounded-2xl"
            source={{
              uri: "https://cdn.storims.com/api/v2/image/resize?path=https://storage.googleapis.com/storims_cdn/storims/uploads/f007009929d5774a0514b07f7269f1b4.jpeg&format=jpeg",
            }}
          />
          <Image
            className="w-[160px] h-[160px] rounded-2xl"
            source={{
              uri: "https://cdn.storims.com/api/v2/image/resize?path=https://storage.googleapis.com/storims_cdn/storims/uploads/f007009929d5774a0514b07f7269f1b4.jpeg&format=jpeg",
            }}
          />
        </View>
        <TouchableOpacity className="bg-[#6255fa] rounded-lg py-3 px-4 shadow-md">
          <Text className="text-white text-lg font-semibold text-center">Tiếp theo</Text>
        </TouchableOpacity>
      </GestureHandlerRootView>
    </ScrollView>
  </SafeAreaView>
  );
};

export default UserDetail;
