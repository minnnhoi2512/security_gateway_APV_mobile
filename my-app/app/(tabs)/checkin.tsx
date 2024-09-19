import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import Header from "@/components/Header";

const checkin = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header name="Đặng Dương" />
      <View className="flex-1 justify-center items-center px-4">
        <TouchableOpacity
          className="w-full max-w-xs aspect-square bg-blue-500 rounded-lg justify-center items-center"
          onPress={() => console.log("Check-in pressed")}
        >
          <View className="w-12 h-12 border-2 border-white rounded-sm justify-center items-center">
            <View className="w-3 h-3 bg-white" />
          </View>
          <Text className="text-white text-lg font-semibold mt-4">
            Tiến hành check in
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default checkin;
