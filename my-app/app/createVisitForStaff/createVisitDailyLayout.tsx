import { View, Text, SafeAreaView, Pressable, Alert } from "react-native";
import React, { useState } from "react";
import { ProgressSteps, ProgressStep } from "react-native-progress-steps";
import { MaterialIcons } from "@expo/vector-icons";
import CreateVisitDailyForStaffScreen1 from "./createVisitDailyForStaffScreen1";
import CreateVisitDailyForStaffScreen2 from "./createVisitDailyForStaffScreen2";
import VisitStaffCreate from "@/Types/VisitStaffCreate.Type";
import { useSelector } from "react-redux";
import { useCreateVisitMutation } from "@/redux/services/visit.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const createVisitDailyLayout = () => {
  const progressStepsStyle = {
    activeStepIconBorderColor: "#3244A8",
    activeLabelColor: "#3244A8",
    activeStepNumColor: "white",
    activeStepIconColor: "#3244A8",
    completedStepIconColor: "#3244A8",
    completedProgressBarColor: "#3244A8",
    completedCheckColor: "white",
    disabledStepIconColor: "#E0E0E0",
    disabledStepNumColor: "#A0A0A0",
  };

  const [createVisit, { isLoading }] = useCreateVisitMutation();
  const visitCreateData = useSelector<any>((s) => s.visitStaff.data) as VisitStaffCreate;
  const router = useRouter();
  const [error, SetError] = useState(true);

  const onNextStep = () => {
    // Validation logic
  };

  const onNextStep2 = async () => {
    // Submission logic
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Pressable onPress={handleGoBack} className="flex flex-row items-center m-4 space-x-2 px-4 rounded-lg active:bg-gray-200">
        <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
        <Text className="text-gray-600 text-base font-medium">Quay về</Text>
      </Pressable>

      <View className="items-center my-6">
        <Text className="text-2xl font-bold text-blue-800">Tạo mới lịch hẹn</Text>
      </View>

      <ProgressSteps {...progressStepsStyle} className="px-4">
        <ProgressStep
          label="Tiêu đề"
          nextBtnTextStyle={{
            color: "#10B981",
            fontWeight: "bold",
            backgroundColor: "#D1FAE5",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
          }}
          onNext={onNextStep}
          errors={error}
        >
          <View className="flex-1 py-2">
            <CreateVisitDailyForStaffScreen1 />
          </View>
        </ProgressStep>

        <ProgressStep
          label="Thêm khách"
          nextBtnTextStyle={{
            color: "#FFFFFF",
            fontWeight: "bold",
            backgroundColor: "#10B981",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
          }}
          onSubmit={onNextStep2}
          errors={error}
        >
          <View className="flex-1 py-2">
            <CreateVisitDailyForStaffScreen2 />
          </View>
        </ProgressStep>
      </ProgressSteps>
    </SafeAreaView>
  );
};

export default createVisitDailyLayout;