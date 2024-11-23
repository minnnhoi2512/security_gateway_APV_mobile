import { View, Text, Button, TouchableOpacity } from "react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import VisitStaffCreate from "@/Types/VisitStaffCreate.Type";
import VisitDetailType from "@/Types/VisitDetailCreate.Type";
import { setVisitStaffCreate } from "@/redux/slices/visitStaffCreate.slice";
import { Ionicons } from "@expo/vector-icons";

const VistorInforModal: React.FC<{ visitor: any }> = ({ visitor }) => {
  var visitCreateData = useSelector<any>(
    (s) => s.visitStaff.data
  ) as VisitStaffCreate;
  const dispatch = useDispatch();
  const handleAddVisitor = () => {
    var oldItem = [...visitCreateData.visitDetail];
    var newItem: VisitDetailType = {
      expectedEndHour: oldItem[0].expectedEndHour,
      expectedStartHour: oldItem[0].expectedStartHour,
      visitorId: visitor.visitorId,
      visitorCompany: visitor.companyName,
      visitorName: visitor.visitorName,
    };
    if (!oldItem.find((s) => s.visitorId === visitor.visitorId)) {
      oldItem.push(newItem);
    }
    visitCreateData = {
      ...visitCreateData,
      visitDetail: oldItem,
    };
    dispatch(setVisitStaffCreate(visitCreateData));
  };

  return (
    <View className="bg-white rounded-2xl shadow-lg p-6 mx-4 my-2">
      <View className="border-b border-gray-200 pb-4 mb-4">
        <Text className="text-2xl font-bold text-[#d35400]">
          {visitor.visitorName}
        </Text>
      </View>

      <View>
        <View className="flex-row items-center gap-2 mb-5">
          <Ionicons name="id-card" size={20} color="#2ecc71" className="mr-2" />
          <Text className="text-[#2ecc71] font-medium">
            Mã số ID: {visitor.visitorId}
          </Text>
        </View>

        {visitor.companyName && (
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="business"
              size={20}
              color="#2ecc71"
              className="mr-2"
            />
            <Text className="text-[#2ecc71] font-medium">
              Công ty: {visitor.companyName}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row justify-end space-x-4 mt-6">
        <TouchableOpacity
          className="bg-[#f4d03f] px-4 py-2 rounded-lg"
          onPress={() => {}}
        >
          <Text className="text-white font-semibold">Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-[#5dade2] px-4 py-2 rounded-lg"
          onPress={handleAddVisitor}
        >
          <Text className="text-white font-semibold">Xác nhận</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VistorInforModal;
