import { View, Text, SafeAreaView, Pressable, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { ProgressSteps, ProgressStep } from "react-native-progress-steps";
import { MaterialIcons } from "@expo/vector-icons";
import CreateVisitDailyForStaffScreen1 from "./createVisitDailyForStaffScreen1";
import CreateVisitDailyForStaffScreen2 from "./createVisitDailyForStaffScreen2";
import VisitStaffCreate from "@/Types/VisitStaffCreate.Type";
import { useDispatch, useSelector } from "react-redux";
import { useCreateVisitMutation } from "@/redux/services/visit.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { isApiError } from "@/redux/Types/ApiError";
import { initialState, setVisitStaffCreate } from "@/redux/slices/visitStaffCreate.slice";
import { useFocusEffect } from '@react-navigation/native';

const createVisitDailyLayout = () => {
  const dispatch = useDispatch();
  const buttonTextStyle = {
    color: "green",
  };
  const progressStepsStyle = {
    activeStepIconBorderColor: "#3244a8",
    activeLabelColor: "#3244a8",
    activeStepNumColor: "white",
    activeStepIconColor: "#3244a8",
    completedStepIconColor: "#3244a8",
    completedProgressBarColor: "#3244a8",
    completedCheckColor: "white",
  };
  const [createVisit, { isLoading }] = useCreateVisitMutation();
  const visitCreateData = useSelector<any>(
    (s) => s.visitStaff.data
  ) as VisitStaffCreate;
  const router = useRouter();
  const [error, SetError] = useState(true);

  const onNextStep = () => {
    const currentDateTime = new Date();
    const startHourParts = visitCreateData.visitDetail[0].expectedStartHour.split(":");
    const endHourParts = visitCreateData.visitDetail[0].expectedEndHour.split(":");
  
    const startHour = new Date(currentDateTime);
    startHour.setHours(parseInt(startHourParts[0]), parseInt(startHourParts[1]));
  
    const endHour = new Date(currentDateTime);
    endHour.setHours(parseInt(endHourParts[0]), parseInt(endHourParts[1]));
  
    if (!visitCreateData.visitName) {
      SetError(true);
      Alert.alert("Bạn phải điền vào trường tiêu đề!");
      return;
    }
    if (!visitCreateData.description) {
      SetError(true);
      Alert.alert("Bạn phải điền vào trường mô tả!");
      return;
    }
    if (!visitCreateData.visitDetail[0].expectedStartHour) {
      SetError(true);
      Alert.alert("Bạn phải điền vào trường thời gian bắt đầu!");
      return;
    }
    if (!visitCreateData.visitDetail[0].expectedEndHour) {
      SetError(true);
      Alert.alert("Bạn phải điền vào trường thời gian kết thúc!");
      return;
    }
    if (startHour < currentDateTime) {
      SetError(true);
      Alert.alert("Thời gian bắt đầu phải lớn hơn thời gian hiện tại!");
      return;
    }
    if (startHour >= endHour) {
      SetError(true);
      Alert.alert("Thời gian kết thúc phải lớn hơn thời gian bắt đầu!");
      return;
    }
    // Thêm 30 phút vào giờ bắt đầu
    const startHourPlus30Minutes = new Date(startHour.getTime() + 30 * 60000);
    if (endHour < startHourPlus30Minutes) {
      SetError(true);
      Alert.alert("Thời gian kết thúc phải lớn hơn thời gian bắt đầu ít nhất 30 phút!");
      return;
    }
    SetError(false);
  };

  const onNextStep2 = async () => {
    if (visitCreateData.visitDetail.length === 1) {
      SetError(true);
      Alert.alert("Không có khách nào được chọn");
    } else {
      try {
        const userId = await AsyncStorage.getItem("userId");
        var submitData = {
          ...visitCreateData,
          visitQuantity: visitCreateData.visitDetail.length - 1,
          createById: Number(userId),
          responsiblePersonId: Number(userId),
        };
        console.log(submitData.visitQuantity);

        submitData.visitDetail = submitData.visitDetail.slice(
          1,
          submitData.visitDetail.length
        );

        const result = await createVisit(submitData)
          .unwrap()
          .then((res) => {
            Alert.alert("Thành công", "Tạo lịch ghé thăm thành công!", [
              {
                text: "OK",
                onPress: () => {
                  dispatch(setVisitStaffCreate(initialState));
                  router.back();
                },
              },
            ]);
          });
      } catch (error) {
        console.log("Check", isApiError(error))
        if (isApiError(error)) {
          Alert.alert("Tạo chuyến thăm lỗi", error.data.message, [
            {
              text: "OK",
            },
          ]);
        } else {
          console.log("CheckError", error);

          Alert.alert("Tạo chuyến thăm lỗi", "Tạo lịch ghé thăm không thành công!", [
            {
              text: "OK",
            },
          ]);
        }
        console.log(error);
      }
      SetError(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        dispatch(setVisitStaffCreate(initialState));
      };
    }, [dispatch])
  );

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Pressable
        onPress={handleGoBack}
        className="flex flex-row items-center m-2 space-x-2 px-4 rounded-lg active:bg-gray-200"
      >
        <MaterialIcons name="arrow-back" size={27} color="#4B5563" />
        <Text className="text-gray-600 text-lg">Quay về</Text>
      </Pressable>
      <View className="items-center">
        <Text className="text-2xl font-bold text-colorTitleHeader">
          Tạo mới lịch hẹn
        </Text>
      </View>
      <ProgressSteps {...progressStepsStyle}>
        <ProgressStep
          label="Tiêu đề"
          scrollable={false}
          nextBtnTextStyle={buttonTextStyle}
          nextBtnText="Tiếp theo"
          onNext={onNextStep}
          errors={error}
        >
          <View style={{ height: "90%" }}>
            <CreateVisitDailyForStaffScreen1 />
          </View>
        </ProgressStep>
        <ProgressStep
          label="Thêm khách"
          scrollable={false}
          finishBtnText="Tạo chuyến thăm"
          previousBtnText="Quay về"
          nextBtnTextStyle={buttonTextStyle}
          onSubmit={onNextStep2}
          errors={error}
          nextBtnDisabled={isLoading} // Disable button when loading
        >
          <View style={{ height: "90%" }}>
            <CreateVisitDailyForStaffScreen2 />
            {isLoading && (
              <ActivityIndicator size="large" color="#0000ff" />
            )}
          </View>
        </ProgressStep>
      </ProgressSteps>
    </SafeAreaView>
  );
};

export default createVisitDailyLayout;