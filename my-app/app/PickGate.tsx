import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useGetAllGateQuery } from "@/redux/services/gate.service";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { setSelectedGate } from "@/redux/slices/gate.slice";


interface Gate {
  gateId: number;
  gateName: string;
  gateCoordinate: string;
}

const PickGate: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const selectedGate = useSelector((state: RootState) => state.gate.selectedGateId);
  const screenHeight = Dimensions.get('window').height;

  const { data: gates, error, isLoading } = useGetAllGateQuery();



  const handleSelectGate = (id: number) => {
    dispatch(setSelectedGate(id));
  };

  const handleNext = () => {
    if (selectedGate) {
      router.push({
        pathname: "/(tabs)",
        params: { selectedGate }
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">Failed to load gates</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View style={{ minHeight: screenHeight }} className="flex-1 px-4 py-6">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">Chọn cổng của bạn</Text>
          </View>

          {gates?.map((gate: Gate) => (
            <TouchableOpacity 
              key={gate.gateId} 
              onPress={() => handleSelectGate(gate.gateId)}
              className={`mb-3 ${selectedGate === gate.gateId ? 'scale-102 transform transition-all duration-200' : ''}`}
            >
              <View className={`bg-blue-600 rounded-xl p-3 shadow-md ${selectedGate === gate.gateId ? 'border-2 border-white' : ''}`}>
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-white text-xl font-bold">{gate.gateName}</Text>
                  {selectedGate === gate.gateId && <Feather name="check-circle" size={20} color="white" />}
                </View>
                <View className="flex-row items-center mb-1">
                  <Feather name="clock" size={14} color="white" />
                  <Text className="text-white text-sm ml-1">{gate.gateCoordinate}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Feather name="chevron-right" size={20} color="white" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="mt-2">
          <TouchableOpacity
            onPress={handleNext}
            className={`rounded-xl p-3 items-center ${selectedGate ? 'bg-[#5163B5]' : 'bg-gray-400'}`}
            disabled={!selectedGate} 
          >
            <Text className="text-white font-bold text-lg">Tiếp theo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PickGate;