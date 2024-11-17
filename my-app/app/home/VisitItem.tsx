import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Visit2 } from "@/redux/Types/visit.type";
import { router } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { useGetVisitDetailByIdQuery } from "@/redux/services/visit.service";

interface VisitCardProps {
  visit: Visit2;
}

const VisitItem: React.FC<VisitCardProps> = ({ visit }) => {
  const {
    data: visitDetail,
    isLoading,
    isError,
  } = useGetVisitDetailByIdQuery(visit.visitId.toString());

  if (isLoading) {
    return (
      <View className="flex-row bg-white p-4 rounded-2xl shadow-md mb-4 justify-center items-center">
        <ActivityIndicator size="small" color="#3D5A99" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-row bg-white p-4 rounded-2xl shadow-md mb-4 justify-center items-center">
        <Text className="text-red-500">Failed to load details</Text>
      </View>
    );
  }

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <TouchableOpacity
      key={visit.visitId}
      onPress={() => {
        router.push({
          pathname: `/home/VisitDetail`,
          params: {
            id: visit.visitId,
            visitName: visit.visitName,
            quantity: visit.visitQuantity,
            data: JSON.stringify(visit),
          },
        });
      }}
      className="flex-row bg-white p-4 rounded-2xl shadow-md mb-4"
    >
      <View className="w-20 mr-4 items-center justify-center">
        <Text className="text-lg font-bold text-gray-700">
         07:00 
        </Text>
        <Text className="text-sm text-gray-700">
        -
        </Text>
        <Text className="text-lg font-bold text-gray-700">
          17:00
        </Text>
        {/* <Text className="text-sm text-gray-400 mt-1">AM</Text> */}
      </View>

      <View className="flex-1 border-l border-gray-200 pl-4">
        <Text className="text-lg font-bold text-[#1a5276]">
          {visit.visitName}
        </Text>
        <View className="flex-row items-center mt-1">
          <FontAwesome5 name="user-check" size={14} color="#B0B0B0" />
          <Text className="text-sm text-gray-400 ml-2">
            {visit.createByname}
          </Text>
        </View>
        <View className="flex-row items-baseline mt-2">
          <View className="flex-row items-center">
            <FontAwesome5 name="user-friends" size={14} color="#B0B0B0" />
            <Text className="text-sm text-gray-400 ml-2">
              {visit.visitQuantity} người
            </Text>
          </View>
          <Text className="text-sm text-gray-400 mx-2">•</Text>
          <Text className="text-sm text-gray-400">
            {visit.scheduleTypeName}
          </Text>
        </View>
        
      </View>
    </TouchableOpacity>
  );
};

export default VisitItem;
