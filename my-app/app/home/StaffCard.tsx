import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";

  const StaffCard = ({ staff }: { staff: any }) => {
  return (
    <TouchableOpacity className="items-center mr-4 w-24 rounded-xl p-2 shadow-md bg-white mb-5">
      <View className="relative">
        <Image
          source={{ uri: staff.image }}
          className="w-20 h-16 rounded-2xl"
        />
        <Text className="text-sm font-medium text-gray-700 mb-2 text-center">
          {staff.fullName}
        </Text>
      
      </View>
    </TouchableOpacity>
  );
};

export default StaffCard;
