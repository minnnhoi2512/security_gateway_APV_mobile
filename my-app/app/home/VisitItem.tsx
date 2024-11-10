import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Visit2 } from "@/redux/Types/visit.type";
import { router } from "expo-router";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import home from "./../home";
import { FontWeight } from "@shopify/react-native-skia";
import { styled } from "nativewind";
import RenderHtml from "react-native-render-html";
interface VisitCardProps {
  visit: Visit2;
}
// id, visitName, quantity
const VisitItem: React.FC<VisitCardProps> = ({ visit }) => {
  const htmlContent = visit.description || "";
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
      className="flex-1 bg-[#3d5a99] p-4 rounded-xl shadow-lg transition-all duration-300 active:bg-gray-50 items-center "
    >
      <View className="w-full flex-row my-1">
        <FontAwesome5 name="calendar-alt" size={"30%"} color="#FFFFFF" />
        <Text
          className={`font-bold text-lg ${
            visit.scheduleTypeName === "daily" ? "text-green-600" : "text-white"
          } pl-2`}
        >
          Tên cuộc hẹn: {visit.visitName}
        </Text>
      </View>
      <View className="w-full flex-row my-1">
        <FontAwesome5 name="calendar-alt" size={"30%"} color="#FFFFFF" />
        <Text
          className={`font-bold text-lg ${
            visit.scheduleTypeName === "daily" ? "text-green-600" : "text-white"
          } pl-2`}
        >
          Người tạo: {visit.createByname}
        </Text>
      </View>
      <View className="w-full flex-row my-1">
        <FontAwesome5 name="calendar-alt" size={"30%"} color="#FFFFFF" />
        <Text
          className={`font-bold text-lg ${
            visit.scheduleTypeName === "daily" ? "text-green-600" : "text-white"
          } pl-2`}
        >
          Loại cuộc hẹn: {visit.scheduleTypeName}
        </Text>
      </View>
      <View className="w-full flex-row my-1">
        <FontAwesome5 name="users" size={"30%"} color="#FFFFFF" />
        <Text
          className={`font-bold text-lg ${
            visit.scheduleTypeName === "daily" ? "text-green-600" : "text-white"
          } pl-2`}
        >
          Số lượng người tham gia: {visit.visitQuantity}
        </Text>
      </View>
      {/* <View className='w-full flex-row my-1'>
        <FontAwesome5
          name="calendar-alt"
          size={'30%'}
          color="#FFFFFF"
        />
        <Text
          className={`font-bold text-lg ${visit.scheduleTypeName === "daily"
            ? "text-green-600"
            : "text-white"
            } pl-2`}
        >
          Chi tiết: {visit.description}
        </Text>
      </View> */}

 

      {/* <View className="w-1/6 p-3 m-1 bg-white rounded-full items-center">
        <Ionicons
          name="calendar-outline"
          size={30}
          color="#3d5a99"
        />
      </View>
      <View className="w-4/6">
        <Text
          className={`font-bold text-lg ${visit.scheduleTypeName === "daily"
            ? "text-green-600"
            : "text-white"
            }`}
        >
          Tên cuộc hẹn: {visit.visitName}
        </Text>
        <Text className="text-sm font-medium text-white">
          Tạo bởi: {visit.createByname}
        </Text>
        <Text className="text-sm font-medium text-white">
          Loại tham quan: {visit.scheduleTypeName}
        </Text>

      </View>
      <View className=" w-1/6 aspect-square bg-white rounded-full items-center justify-center">
        <Text className="text-black ">
           {visit.visitQuantity}
        </Text>
      </View> */}
    </TouchableOpacity>
  );
};

export default VisitItem;

const styles = StyleSheet.create({});
