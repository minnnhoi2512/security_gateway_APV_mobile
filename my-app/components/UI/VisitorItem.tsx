import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const VisitorItem: React.FC<{ visitor: any }> = ({ visitor }) => {
  return (
    <View className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <View className="p-4 flex-row items-center">
        <Image
          source={{ uri: 'https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png' }}
          className="w-16 h-16 rounded-full border-2 border-blue-100 mr-4"
        />
        <View className="flex-1">
          <Text className="text-lg font-bold  text-[#d35400]">{visitor.visitorName}</Text>
          <Text className="text-sm text-gray-600">công ty {visitor.visitorCompany}</Text>
        </View>
        {/* <View className="bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
          <Text className="text-green-700 font-semibold text-xs">Đã xác minh</Text>
        </View> */}
      </View>
      <View className="border-t border-gray-200 p-4 bg-gray-50 flex-row">
        <View className="flex-1 items-center">
          <View className="bg-green-100 px-3 py-1 rounded-full mb-2 border border-green-200">
            <Text className="text-green-800 font-medium text-xs">Giờ Vào</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="enter" size={18} color="#15803d" className="mr-2" />
            <Text className="text-lg font-semibold text-green-800"> {visitor.expectedStartHour.split(":").slice(0, 2).join(":")}</Text>
          </View>
        </View>
        <View className="w-[1px] bg-gray-200 mx-4" />
        <View className="flex-1 items-center">
          <View className="bg-red-100 px-3 py-1 rounded-full mb-2 border border-red-200">
            <Text className="text-red-800 font-medium text-xs">Giờ Ra</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="exit" size={18} color="#b91c1c" className="mr-2" />
            <Text className="text-lg font-semibold text-red-800"> {visitor.expectedEndHour.split(":").slice(0, 2).join(":")}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default VisitorItem;