import React from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, ActivityIndicator, StyleSheet } from "react-native";
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
      <View className="flex-1 items-center justify-center bg-[#34495e]">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-[#34495e]">
        <Text className="text-red-500 text-lg">Failed to load gates</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#34495e]">
      <View style={{ minHeight: screenHeight }} className="flex-1 px-4 py-6">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-8 mt-5">
            <Text className="text-3xl font-bold text-white">Chọn cổng của bạn</Text>
          </View>

          {gates?.map((gate: Gate) => (
            <TouchableOpacity 
              key={gate.gateId} 
              onPress={() => handleSelectGate(gate.gateId)}
              className={`mb-4 ${selectedGate === gate.gateId ? ' transform transition-all duration-200' : ''}`}
            >
              <View
                className={`rounded-xl p-4 shadow-lg ${selectedGate === gate.gateId ? 'bg-white' : 'bg-white'}`}
                style={{ 
                  elevation: 5,
                  borderRadius: selectedGate === gate.gateId ? 25 : 12
                }}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className={`text-xl font-bold ${selectedGate === gate.gateId ? 'text-[#34495e]' : 'text-[#34495e]'}`}>
                    {gate.gateName}
                  </Text>
                  {selectedGate === gate.gateId && <Feather name="check-circle" size={24} color="#58d68d" />}
                </View>
                <View className="flex-row items-center mb-2">
                  <Feather name="map-pin" size={16} color={selectedGate === gate.gateId ? "#34495e" : "#34495e"} />
                  <Text className={`text-sm ml-2 ${selectedGate === gate.gateId ? 'text-[#34495e]' : 'text-gray-600'}`}>
                    {gate.gateCoordinate}
                  </Text>
                </View>
                <View className="flex-row justify-end items-center">
                  <Feather name="chevron-right" size={20} color={selectedGate === gate.gateId ? "#34495e" : "#34495e"} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="mb-16">
          <TouchableOpacity
            onPress={handleNext}
            className={`rounded-xl py-4 items-center ${selectedGate ? 'bg-white' : 'bg-gray-300'}`}
            disabled={!selectedGate}
            style={{ elevation: 5 }}
          >
            <Text className={`font-bold text-xl ${selectedGate ? 'text-[#34495e]' : 'text-gray-500'}`}>Tiếp theo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PickGate;