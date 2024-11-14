import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Visit2 } from "@/redux/Types/visit.type";
import { FontAwesome5 } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import RenderHtml from 'react-native-render-html';
interface VisitCardProps {
  visit: Visit2;
}
const VisitItemDetail: React.FC<VisitCardProps> = ({ visit }) => {
  return (
    <TouchableOpacity
      key={visit.visitId}
      className="flex-row bg-white p-4 rounded-2xl shadow-md mb-4"
    >
      {/* <View className="justify-center items-center mr-4">
      <Text className=" font-bold text-[#3D5A99]">{visit.createByname}</Text>
     
    </View> */}

      <View className="flex-1">
        <Text className="text-xl text-center mb-2 font-bold text-[#48c9b0]">
          {visit.visitName}
        </Text>
        <View className="flex-row items-center mt-1">
          <FontAwesome5 name="user-friends" size={14} color="#2980b9" />
          <Text className="text-sm text-gray-400 ml-2">
          Số người tham gia: {visit.visitQuantity}
          </Text>
        </View>
        <View className="flex-row items-center mt-1">
          <FontAwesome5 name="user-check" size={14} color="#2980b9" />
          <Text className="text-sm text-gray-400 ml-2">
          Người tạo: {visit.createByname}
          </Text>
        </View>
        <View className="flex-row items-center mt-1">
          <FontAwesome5 name="calendar-check" size={15} color="#2980b9" />
          <Text className="text-sm text-gray-400 ml-3">
            Loại lịch: {visit.scheduleTypeName}
          </Text>
        </View>
        <View className="flex-row items-center mt-1">
          <SimpleLineIcons name="note" size={15} color="#2980b9" />
          <Text className="text-sm text-gray-400 ml-3">
            Mô tả: {visit.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default VisitItemDetail;
