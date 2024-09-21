import { View, Text, Image } from "react-native";
import React from "react";
import {
  GestureHandlerRootView,
  TouchableOpacity,
} from "react-native-gesture-handler";

const UserDetail = () => {
  return (
    <GestureHandlerRootView className="flex-1 mt-[70px] bg-white p-5">
      <View className="bg-[#6255fa] rounded-2xl p-4 mb-5">
        <Text className="text-[24px] text-white text-center mb-4">
          Doan Thanh Hieu
        </Text>
        <View className="grid grid-cols-2 gap-2 mb-4">
          <View className="col-span-1">
            <Text className="text-white">034 999 9999</Text>
          </View>
          <View className="col-span-1">
            <Text className="text-white">hieu@gmail.com</Text>
          </View>
        </View>
        <Text className="text-white mb-2">Khach hang binh thuong</Text>
        <TouchableOpacity className="flex justify-center bg-white rounded-lg px-1 py-1">
          <Text className="text-[#6255fa] m-2 text-[18px] text-center">Xem chi tiet lich hen</Text>
        </TouchableOpacity>

      </View>

     
      <View className="flex-row justify-around mt-5">
        <Image
          className="w-[150px] h-[136px] rounded-2xl"
          source={{
            uri: "https://cdn.storims.com/api/v2/image/resize?path=https://storage.googleapis.com/storims_cdn/storims/uploads/f007009929d5774a0514b07f7269f1b4.jpeg&format=jpeg",
          }}
        />
        <Image
          className="w-[150px] h-[136px] rounded-2xl"
          source={{
            uri: "https://cdn.storims.com/api/v2/image/resize?path=https://storage.googleapis.com/storims_cdn/storims/uploads/f007009929d5774a0514b07f7269f1b4.jpeg&format=jpeg",
          }}
        />
      </View>
      <TouchableOpacity className="bg-white rounded p-2 ">
          <Text className="text-[#6255fa]">Tiep theo</Text>
        </TouchableOpacity>
    </GestureHandlerRootView>
  );
};

export default UserDetail;
