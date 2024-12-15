import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface TimePickerProps {
  label: string;
  value: string;
  onPress: () => void;
  showPicker: boolean;
  onTimeChange: (event: any, date: Date | undefined) => void;
  field: string;
  hasError: (field: string) => boolean;
  getErrorMessage: (field: string) => string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onPress,
  showPicker,
  onTimeChange,
  field,
  hasError,
  getErrorMessage,
}) => (
  <View className="flex-1">
    <Text className="text-base font-semibold text-gray-700 mb-2">{label}</Text>
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

export default React.memo(TimePicker);