import React from "react";
import { Text, TextInput, View } from "react-native";

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  field: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
  hasError: (field: string) => boolean;
  getErrorMessage: (field: string) => string;
}

const InputFieldCreateVisit: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  field,
  multiline = false,
  keyboardType = "default",
  hasError,
  getErrorMessage,
}) => (
  <View className="mb-4">
    <Text className="text-base font-semibold text-gray-700 mb-2">{label}</Text>
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

export default InputFieldCreateVisit;