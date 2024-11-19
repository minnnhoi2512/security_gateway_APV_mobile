import { View, Text, useWindowDimensions } from "react-native";
import React from "react";
import { Visit2 } from "@/redux/Types/visit.type";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

interface VisitCardProps {
  visit: Visit2;
}

const VisitItemDetail: React.FC<VisitCardProps> = ({ visit }) => {
  const { width } = useWindowDimensions();

  const getPlainDescription = (html: string) => {
    return html.replace(/<[^>]+>/g, "");
  };

  return (
    <View className="bg-white rounded-3xl shadow-lg p-6 mb-4">
      <View className="items-center mb-6">
        <View className="bg-teal-50 rounded-full px-6 py-2 mb-3">
          <Text className="text-2xl font-bold text-teal-600">
            {visit.visitName}
          </Text>
        </View>
        <View className="flex-row items-center space-x-2">
          <Text className="text-lg font-semibold text-gray-600">
            {visit.visitDetailStartTime?.split(":").slice(0, 2).join(":")}
          </Text>
          <Text className="text-lg font-semibold text-gray-400">-</Text>
          <Text className="text-lg font-semibold text-gray-600">
            {visit.visitDetailEndTime?.split(":").slice(0, 2).join(":")}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="items-center bg-purple-50 rounded-xl px-4 py-2 flex-1 mx-1">
          <FontAwesome5 name="users" size={20} color="#9b59b6" />
          <Text className="text-xs text-gray-500 mt-1">Tổng số</Text>
          <Text className="text-lg font-bold text-purple-600">
            {visit.visitQuantity}
          </Text>
        </View>
        <View className="items-center bg-blue-50 rounded-xl px-4 py-2 flex-1 mx-1">
          <FontAwesome5 name="user-check" size={20} color="#2980b9" />
          <Text className="text-xs text-gray-500 mt-1">Đã vào</Text>
          <Text className="text-lg font-bold text-blue-600">
            {visit.visitorSessionCheckedInCount}
          </Text>
        </View>
        <View className="items-center bg-red-50 rounded-xl px-4 py-2 flex-1 mx-1">
          <FontAwesome5 name="user-times" size={20} color="#e74c3c" />
          <Text className="text-xs text-gray-500 mt-1">Đã ra</Text>
          <Text className="text-lg font-bold text-red-600">
            {visit.visitorSessionCheckedOutCount}
          </Text>
        </View>
      </View>

      <View className="space-y-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
            <FontAwesome5 name="user-tie" size={18} color="#2980b9" />
          </View>
          <View className="ml-3">
            <Text className="text-xs text-gray-500">Người tạo</Text>
            <Text className="text-base font-semibold text-gray-700">
              {visit.createByname}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center">
            <MaterialCommunityIcons
              name="calendar-clock"
              size={20}
              color="#27ae60"
            />
          </View>
          <View className="ml-3">
            <Text className="text-xs text-gray-500">Loại lịch</Text>
            <Text className="text-base font-semibold text-gray-700">
              {visit.scheduleTypeName || "Lịch hàng ngày"}
            </Text>
          </View>
        </View>

        {visit.description && (
          <View className="flex-row items-start">
            <View className="w-10 h-10 bg-yellow-50 rounded-full items-center justify-center">
              <MaterialCommunityIcons
                name="note-text"
                size={20}
                color="#f1c40f"
              />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-500">Mô tả</Text>
              <Text className="text-base text-gray-700">
                {getPlainDescription(visit.description)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default VisitItemDetail;
