import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import VisitStaffCreate from "@/Types/VisitStaffCreate.Type";
import { setVisitStaffCreate } from "@/redux/slices/visitStaffCreate.slice";
import { useDispatch, useSelector } from "react-redux";

interface ValidationErrors {
  [key: string]: string;
}

const CreateVisitDailyForStaffScreen1: React.FC = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const dispatch = useDispatch();

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const visitCreateData = useSelector<any>(
    (s) => s.visitStaff.data
  ) as VisitStaffCreate;
  const [visitData, setVisitData] = useState<VisitStaffCreate>(visitCreateData);

  const formatTimeDisplay = (time: string) => {
    return time.slice(0, 5);
  };
  const hasError = (field: string): boolean => {
    return validationErrors[field] !== undefined;
  };

  const getErrorMessage = (field: string): string => {
    return validationErrors[field] || "";
  };

  const handleInputChange = (field: string, value: any) => {
    if (field === "visitQuantity") {
      setVisitData((prev) => ({
        ...prev,
        [field]: Number(value),
      }));
    } else {
      setVisitData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleDetailChange = (field: string, value: any) => {
    setVisitData((prev) => ({
      ...prev,
      visitDetail: [{ ...prev.visitDetail[0], [field]: value }],
    }));
  };

  useEffect(() => {
    dispatch(setVisitStaffCreate(visitData));
  }, [visitData]);

  const handleTimeChange = (
    event: any,
    selectedDate: Date | undefined,
    isStartTime: boolean
  ) => {
    const currentDate = selectedDate || new Date();
    const timeString = currentDate
      .toLocaleTimeString("en-US", { hour12: false })
      .slice(0, 5);

    if (isStartTime) {
      setShowStartPicker(false);
      handleDetailChange("expectedStartHour", timeString);
    } else {
      setShowEndPicker(false);
      handleDetailChange("expectedEndHour", timeString);
    }
  };

  const InputField: React.FC<{
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    field: string;
    multiline?: boolean;
    keyboardType?: "default" | "numeric";
  }> = ({
    label,
    value,
    onChangeText,
    placeholder,
    field,
    multiline = false,
    keyboardType = "default",
  }) => (
    <View className="mb-4">
      <Text className="text-base font-semibold text-gray-700 mb-2">
        {label}
      </Text>
      <TextInput
        className={`bg-white border ${
          hasError(field) ? "border-red-500" : "border-gray-200"
        } rounded-2xl px-4 py-3.5 text-gray-800 ${
          multiline ? "h-24 text-left align-text-top" : ""
        }`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        style={{ textAlignVertical: multiline ? "top" : "center" }}
      />
      {hasError(field) && (
        <Text className="text-red-500 text-sm mt-1 ml-1">
          {getErrorMessage(field)}
        </Text>
      )}
    </View>
  );

  const TimePicker: React.FC<{
    label: string;
    value: string;
    onPress: () => void;
    showPicker: boolean;
    onTimeChange: (event: any, date: Date | undefined) => void;
    field: string;
  }> = ({ label, value, onPress, showPicker, onTimeChange, field }) => (
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-700 mb-2">
        {label}
      </Text>
      <TouchableOpacity
        className={`bg-white border ${
          hasError(field) ? "border-red-500" : "border-gray-200"
        } rounded-2xl px-4 py-3.5 flex-row items-center justify-between`}
        onPress={onPress}
      >
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={20} color="#6b7280" />
          <Text className="text-gray-800 ml-2">{value}</Text>
        </View>
        <MaterialIcons name="arrow-drop-down" size={24} color="#6b7280" />
      </TouchableOpacity>
      {hasError(field) && (
        <Text className="text-red-500 text-sm mt-1 ml-1">
          {getErrorMessage(field)}
        </Text>
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
        contentContainerStyle={{ padding: 16 }}
        // keyboardShouldPersistTaps="always"
      >
        <View className="bg-white rounded-3xl p-6 shadow-lg">
          <InputField
            label="Tiêu đề"
            value={visitCreateData.visitName}
            onChangeText={(text) => handleInputChange("visitName", text)}
            placeholder="Nhập tiêu đề chuyến thăm"
            field="visitName"
          />

          <InputField
            label="Mô tả"
            value={visitData.description}
            onChangeText={(text) => handleInputChange("description", text)}
            placeholder="Nhập mô tả chi tiết về chuyến thăm"
            field="description"
            multiline
          />

          <InputField
            label="Số lượng"
            value={visitData.visitQuantity.toString()}
            onChangeText={(text) => handleInputChange("visitQuantity", text)}
            placeholder="Nhập số lượng chuyến thăm"
            field="visitQuantity"
            keyboardType="numeric"
          />

          <View className="flex-row">
            <View className="mr-9">
              <TimePicker
                label="Thời gian bắt đầu"
                value={visitData.visitDetail[0].expectedStartHour}
                onPress={() => setShowStartPicker(true)}
                showPicker={showStartPicker}
                onTimeChange={(event, selectedDate) =>
                  handleTimeChange(event, selectedDate, true)
                }
                field="visitDetail[0].expectedStartHour"
              />
            </View>
            <View>
              <TimePicker
                label="Thời gian kết thúc"
                value={visitData.visitDetail[0].expectedEndHour}
                onPress={() => setShowEndPicker(true)}
                showPicker={showEndPicker}
                onTimeChange={(event, selectedDate) =>
                  handleTimeChange(event, selectedDate, false)
                }
                field="visitDetail[0].expectedEndHour"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateVisitDailyForStaffScreen1;
