import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CreateVisitorForStaff from "./createVisitorForStaff";
import VisitorItem from "@/components/UI/VisitorItem";
import { useGetVisitorByCreadentialCardQuery } from "@/redux/services/visitor.service";
import VistorInforModal from "@/components/UI/VistorInforModal";
import { useSelector } from "react-redux";
import VisitStaffCreate from "@/Types/VisitStaffCreate.Type";

const CreateVisitDailyForStaffScreen2 = () => {
  const { data } = useLocalSearchParams();
  const [modalStatus, SetModalStatus] = useState(false);
  const [action, SetAction] = useState("");
  // const [credentialCardId , SetCredentialCardId] = useState()
  const [credentialCardId, setCredentialCardId] = useState<string>("");

  const {
    data: visitData,
    error,
    isLoading,
    isFetching,
  } = useGetVisitorByCreadentialCardQuery(credentialCardId || "", {
    skip: !credentialCardId,
    refetchOnMountOrArgChange: 2,
    refetchOnFocus: true,
  });
  const visitCreateData = useSelector<any>(
    (s) => s.visitStaff.data
  ) as VisitStaffCreate;
  const openAddVisitorHandler = (type: string) => {
    if (type === "ADD") {
      SetAction("ADD");
      if (!modalStatus) {
        SetModalStatus(true);
      }
    }
    if (type === "FIND") {
      if (visitData) {
        SetAction("FIND");
        if (!modalStatus) {
          SetModalStatus(true);
        }
      } else {
        Alert.alert("Not found Visitor");
      }
    }
  };
  const closeAddVisitorHandler = () => {
    if (modalStatus) {
      SetModalStatus(false);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center space-x-2 mb-4">
          <View className="flex-1 bg-white rounded-xl border border-gray-200 flex-row items-center shadow-sm">
            <TextInput
              className="flex-1 px-4 py-3 text-gray-800 text-base rounded-xl"
              maxLength={12}
              placeholder="Nhập CCCD của khách..."
              onChangeText={setCredentialCardId}
              placeholderTextColor="gray"
            />
            <TouchableOpacity
              className="p-3 bg-blue-500 rounded-r-xl"
              onPress={() => openAddVisitorHandler("FIND")}
            >
              <Ionicons name="search" color="white" size={20} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="bg-green-500 p-3 rounded-xl"
            onPress={() => openAddVisitorHandler("ADD")}
          >
            <Ionicons name="add" color="white" size={24} />
          </TouchableOpacity>
        </View>

        <Modal
          visible={modalStatus}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View className="flex-1 bg-gray-50 p-4">
            <TouchableOpacity
              className="self-end mb-4 bg-red-500 px-4 py-2 rounded-lg"
              onPress={closeAddVisitorHandler}
            >
              <Text className="text-white font-semibold">Đóng</Text>
            </TouchableOpacity>

            {action === "ADD" && <CreateVisitorForStaff />}
            {action === "FIND" && <VistorInforModal visitor={visitData} />}
          </View>
        </Modal>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {visitCreateData.visitDetail.map((item, index) =>
            item.visitorId != 0 ? (
              <VisitorItem key={item.visitorId || index} visitor={item} />
            ) : null
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateVisitDailyForStaffScreen2;
