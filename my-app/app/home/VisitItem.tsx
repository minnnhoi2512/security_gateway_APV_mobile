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

interface VisitCardProps {
  visit: Visit2;
}

const VisitItem: React.FC<VisitCardProps> = ({ visit }) => {
  const getStatusStyles = (status: string | undefined) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "ActiveTemporary":
        return "bg-yellow-50 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getCardBackground = (status: string | undefined) => {
    switch (status) {
      case "Active":
        return "bg-white";
      case "ActiveTemporary":
        return "bg-gray-50"; // hoặc bg-neutral-50 để nhạt hơn
      default:
        return "bg-white";
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "Active":
        return "check-circle";
      case "ActiveTemporary":
        return "clock";
      default:
        return "info-circle";
    }
  };

  const getTextColorClass = () => {
    switch (visit.scheduleTypeName) {
      case "ProcessWeek":
        return "text-[#138d75]";
      case "ProcessMonth":
        return "text-[#2980b9]";
      case "ProcessYear":
        return "text-[#e67e22]";
      default:
        return "text-[#1a5276]";
    }
  };

  const getText = () => {
    switch (visit.scheduleTypeName) {
      case "ProcessWeek":
        return "Lịch theo tuần";
      case "ProcessMonth":
        return "Lịch theo tháng";
      case "ProcessYear":
        return "Lịch theo năm";
      default:
        return "Lịch hàng ngày";
    }
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
      className={`flex-row p-4 rounded-2xl shadow-md mb-4 ${getCardBackground(
        visit.visitStatus
      )}`}
    >
      {/* Rest of your code remains the same */}
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
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-bold text-[#1a5276] flex-1 mr-2">
            {visit.visitName}
          </Text>
        </View>

        {/* {(visit.visitorSessionCheckedInCount || 0) > 0 && (
          <View className="bg-green-100 px-2 py-1 rounded items-center mb-2">
            <Text className="text-sm text-green-600">Đã có khách vào</Text>
          </View>
        )} */}

        <View className="flex-row items-baseline">
          <View className="flex-row items-center">
            <FontAwesome5 name="user-friends" size={14} color="#e67e22" />
            <Text className="text-sm text-[#1a5276] ml-2">
              {visit.visitQuantity} người
            </Text>
          </View>
          <Text className="text-sm text-[#1a5276] mx-2">•</Text>
          <Text className={`text-sm ${getTextColorClass()}`}>{getText()}</Text>
          {/* <Text className="text-sm text-[#1a5276]">
            {visit.scheduleTypeName === "ProcessWeek"
              ? "Lịch theo tuần"
              : visit.scheduleTypeName === "ProcessMonth"
              ? "Lịch theo tháng"
              : visit.scheduleTypeName === "ProcessYear"
              ? "Lịch theo năm"
              : "Lịch hàng ngày"}
          </Text> */}
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
              Vào: {visit.visitorCheckkInCount}
            </Text>
          </View>

          <View className="flex-row items-center">
            <FontAwesome5 name="sign-out-alt" size={14} color="#F44336" />
            <Text className="text-sm text-gray-600 ml-2">
              Ra: {visit.visitorCheckkOutCount}
            </Text>
          </View>
        </View>
        <View
          className={`self-start rounded-full px-2 py-1 flex-row items-center mt-3 ${getStatusStyles(
            visit.visitStatus
          )}`}
        >
          <FontAwesome5
            name={getStatusIcon(visit.visitStatus)}
            size={12}
            color={
              visit.visitStatus === "Active"
                ? "#15803d"
                : visit.visitStatus === "ActiveTemporary"
                ? "#b45309"
                : "#4b5563"
            }
            className="mr-1"
          />
          <Text
            className={`text-xs font-medium ml-1 ${getStatusStyles(
              visit.visitStatus
            )}`}
          >
            {visit.visitStatus === "Active"
              ? "Hoạt động"
              : visit.visitStatus === "ActiveTemporary"
              ? "Tạm thời"
              : visit.visitStatus === "Violation"
              ? "Vi phạm"
              : visit.visitStatus === "ViolationResolved"
              ? "Đã xử lí"
              : visit.visitStatus}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default VisitItem;
