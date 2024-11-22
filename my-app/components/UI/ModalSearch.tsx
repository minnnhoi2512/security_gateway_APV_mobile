import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ButtonSingleTextMainColor from "./ButtonSingleTextMainColor";
interface ModalSearchProps {
  isVisible: boolean;
  onClose: () => void;
  value: string;
  setValue: (value: string) => void;
  handleSearch: () => void;
  isLoading: boolean;
  error: any;
  placeholder?: string;
}
const ModalSearch: React.FC<ModalSearchProps> = ({
  isVisible,
  onClose,
  value,
  setValue,
  handleSearch,
  isLoading,
  error,
  placeholder = "Nhập thông tin tìm kiếm",
}) => {
  const [isSearchStarted, setIsSearchStarted] = useState(false);
  const onSearchPress = () => {
    setIsSearchStarted(true);
    handleSearch();
  };
  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-center items-center bg-[rgba(0,0,0,0.5)]">
        <View className="w-72 bg-white rounded-lg p-5 items-center shadow-lg">
          <TouchableOpacity
            className="absolute top-3 right-3"
            onPress={() => {
              onClose();
            }}
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold mb-4">Tìm kiếm</Text>
          <TextInput
            className="w-full p-2 border border-gray-300 rounded mb-5"
            onChangeText={(text) => {
              setValue(text);
              setIsSearchStarted(false);
            }}
            value={value}
            placeholder={placeholder}
            keyboardType="default"
          />
          <TouchableOpacity>
            <ButtonSingleTextMainColor
              text="Tìm"
              onPress={onSearchPress}
              width={200}
              height={50}
            />
          </TouchableOpacity>
          {isSearchStarted && isLoading && (
            <ActivityIndicator size="small" color="#0000ff" />
          )}
          {isSearchStarted && error && (
            <Text className="text-red-500 mt-3">
              Không tìm thấy kết quả phù hợp
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ModalSearch;

const styles = StyleSheet.create({});
