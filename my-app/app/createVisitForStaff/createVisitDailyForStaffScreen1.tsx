import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import VisitStaffCreate from "@/Types/VisitStaffCreate.Type";
import { setVisitStaffCreate } from "@/redux/slices/visitStaffCreate.slice";
import { useDispatch, useSelector } from "react-redux";

const CreateVisitDailyForStaffScreen1 = () => {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const dispatch = useDispatch();
  const hasError = (field: string) => {
    return validationErrors[field] !== undefined;
  };

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };
  const visitCreateData = useSelector<any>(
    (s) => s.visitStaff.data
  ) as VisitStaffCreate;
  const [visitData, setVisitData] = useState<VisitStaffCreate>(
    useSelector<any>((s) => s.visitStaff.data) as VisitStaffCreate
  );

  const handleInputChange = (field: string, value: any) => {
    if (field !== "visitQuantity") {
      setVisitData((prevState) => ({
        ...prevState,
        [field]: value,
      }));
    } else {
      setVisitData((prevState) => ({
        ...prevState,
        [field]: Number(value),
      }));
    }
  };
  useEffect(() => {
    dispatch(setVisitStaffCreate(visitData));
  }, [visitData]);
  const handleDetailChange = (field: string, value: any) => {
    setVisitData((prevState) => ({
      ...prevState,
      visitDetail: [{ ...prevState.visitDetail[0], [field]: value }],
    }));
  };
  const getErrorMessage = (field: string) => {
    return validationErrors[field];
  };
  const handleTimeChange = (
    event: any,
    selectedDate: Date | undefined,
    isStartTime: boolean
  ) => {
    const currentDate = selectedDate || new Date();
    const timeString = currentDate
      .toLocaleTimeString("en-US", { hour12: false })
      .slice(0, 8);

    if (isStartTime) {
      setShowStartPicker(false);
      handleDetailChange("expectedStartHour", timeString);
    } else {
      setShowEndPicker(false);
      handleDetailChange("expectedEndHour", timeString);
    }
  };

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    field: string,
    multiline: boolean = false,
    keyboardType: "default" | "numeric" = "default"
  ) => (
    <View className="mb-4">
      <Text className="text-base font-semibold text-[#34495e] mb-2">{label}</Text>
      <TextInput
        className={`bg-white border ${
          hasError(field) ? "border-red-500" : "border-gray-300"
        } rounded-xl px-4 py-3 text-gray-900 `}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="gray"
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
      />
      {hasError(field) && (
        <Text className="text-red-500 text-sm mt-1">{getErrorMessage(field)}</Text>
      )}
    </View>
  );

  const renderTimePicker = (
    label: string,
    value: string,
    onPress: () => void,
    showPicker: boolean,
    onTimeChange: (event: any, date: Date | undefined) => void,
    field: string
  ) => (
    <View className="mb-4">
      <Text className="text-base font-semibold text-[#34495e] mb-2">{label}</Text>
      <TouchableOpacity
        className={`bg-white border ${
          hasError(field) ? "border-red-500" : "border-gray-300"
        } rounded-xl px-4 py-3 flex-row items-center justify-between `}
        onPress={onPress}
      >
        <Text className="text-gray-800">{value}</Text>
        <MaterialIcons name="access-time" size={24} color="gray" />
      </TouchableOpacity>
      {hasError(field) && (
        <Text className="text-red-500 text-sm mt-1">{getErrorMessage(field)}</Text>
      )}
      {showPicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    className="flex-1 bg-gray-50"
  >
    <ScrollView 
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="bg-white rounded-2xl p-6 shadow-md">
        {renderInputField(
          "Tiêu đề",
          visitCreateData.visitName,
          (text) => handleInputChange("visitName", text),
          "Nhập tiêu đề chuyến thăm",
          "visitName"
        )}

        {renderInputField(
          "Mô tả",
          visitData.description,
          (text) => handleInputChange("description", text),
          "Nhập mô tả",
          "description",
          true
        )}

        {renderInputField(
          "Số lượng",
          visitData.visitQuantity.toString(),
          (text) => handleInputChange("visitQuantity", text),
          "Nhập số lượng chuyến thăm",
          "visitQuantity",
          false,
          "numeric"
        )}

        {renderTimePicker(
          "Thời gian bắt đầu",
          visitData.visitDetail[0].expectedStartHour,
          () => setShowStartPicker(true),
          showStartPicker,
          (event, selectedDate) => handleTimeChange(event, selectedDate, true),
          "visitDetail[0].expectedStartHour"
        )}

        {renderTimePicker(
          "Thời gian kết thúc",
          visitData.visitDetail[0].expectedEndHour,
          () => setShowEndPicker(true),
          showEndPicker,
          (event, selectedDate) => handleTimeChange(event, selectedDate, false),
          "visitDetail[0].expectedEndHour"
        )}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
  );
};

export default CreateVisitDailyForStaffScreen1;
