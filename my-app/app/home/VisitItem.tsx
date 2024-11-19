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
          <Text className="text-lg font-bold text-[#45b39d]">
          {visit.visitDetailStartTime?.split(":").slice(0, 2).join(":")}
        </Text>
        <Text className="text-sm text-[#45b39d]">-</Text>
        <Text className="text-lg font-bold text-[#45b39d]">
          {visit.visitDetailEndTime?.split(":").slice(0, 2).join(":")}
        </Text>
      </View>

      <View className="flex-1 border-l border-gray-200 pl-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-[#1a5276]">
            {visit.visitName}
          </Text>
          {(visit.visitorSessionCheckedInCount || 0) > 0 && (
            <View className="bg-green-100 px-2 py-1 rounded">
              <Text className="text-sm text-green-600">Đã có khách vào</Text>
            </View>
          )}
        </View>

        <View className="flex-row items-baseline mt-2">
          <View className="flex-row items-center">
            <FontAwesome5 name="user-friends" size={14} color="#e67e22" />
            <Text className="text-sm text-[#1a5276] ml-2">
              {visit.visitQuantity} người
            </Text>
          </View>
          <Text className="text-sm text-[#1a5276] mx-2">•</Text>
          <Text className="text-sm text-[#1a5276]">
            {visit.scheduleTypeName}
          </Text>
        </View>
        <View className="flex-row items-center mt-1">
          <FontAwesome5 name="user-check" size={14} color="#e67e22" />
          <Text className="text-sm text-[#1a5276] ml-2">
            Người tạo • {visit.createByname}
          </Text>
        </View>
        <View className="flex-row items-center mt-2 space-x-3">
          <View className="flex-row items-center">
            <FontAwesome5 name="sign-in-alt" size={14} color="#4CAF50" />
            <Text className="text-sm text-gray-600 ml-2">
              Vào: {visit.visitorSessionCheckedInCount}
            </Text>
          </View>

          <View className="flex-row items-center">
            <FontAwesome5 name="sign-out-alt" size={14} color="#F44336" />
            <Text className="text-sm text-gray-600 ml-2">
              Ra: {visit.visitorSessionCheckedOutCount}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default VisitItem;
