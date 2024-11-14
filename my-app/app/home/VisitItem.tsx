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

  // console.log("visit detail: ", visitDetail);

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
      {/* <View className="justify-center items-center mr-4">
        <Text className=" font-bold text-[#3D5A99]">{visit.createByname}</Text>
       
      </View> */}

      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-800">
          {visit.visitName}
        </Text>
        <View className="flex-row items-center mt-1">
          <FontAwesome5 name="user-friends" size={14} color="#B0B0B0" />
          <Text className="text-sm text-gray-400 ml-2">
            Số người tham gia: {visit.visitQuantity}
          </Text>
        </View>
        <View className="flex-row items-center mt-1">
        <FontAwesome5 name="calendar-check" size={14} color="#B0B0B0" />
          <Text className="text-sm text-gray-400 ml-2">
            Loại lịch: {visit.scheduleTypeName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default VisitItem;
