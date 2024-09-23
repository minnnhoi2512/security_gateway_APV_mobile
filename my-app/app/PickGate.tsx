import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

interface Gate {
  id: string;
  color: string;
  name: string;
  time: string;
  task: string;
  date: string;
}

const PickGate: React.FC = () => {
  const router = useRouter();
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const screenHeight = Dimensions.get('window').height;

  const gates: Gate[] = [
    { id: 'A', color: 'bg-teal-600', name: 'Cổng A', time: '7h00 - 17h30', task: 'Kiểm tra khách vào - ra trong công ty', date: '22/09/2024' },
    { id: 'B', color: 'bg-yellow-600', name: 'Cổng B', time: '7h00 - 17h30', task: 'Kiểm tra khách vào - ra trong công ty', date: '22/09/2024' },
    { id: 'C', color: 'bg-blue-600', name: 'Cổng C', time: '7h00 - 17h30', task: 'Kiểm tra khách vào - ra trong công ty', date: '22/09/2024' }
  ];

  const handleSelectGate = (id: string) => {
    setSelectedGate(id);
  };

  const handleNext = () => {
    if (selectedGate) {
      router.push({
        pathname: "/(tabs)",
        params: { selectedGate }
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View style={{ minHeight: screenHeight }} className="flex-1 px-4 py-6">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">Chọn cổng của bạn</Text>
          </View>

          {gates.map(gate => (
            <TouchableOpacity 
              key={gate.id} 
              onPress={() => handleSelectGate(gate.id)}
              className={`mb-3 ${selectedGate === gate.id ? 'scale-102 transform transition-all duration-200' : ''}`}
            >
              <View className={`${gate.color} rounded-xl p-3 shadow-md ${selectedGate === gate.id ? 'border-2 border-white' : ''}`}>
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-white text-xl font-bold">{gate.name}</Text>
                  {selectedGate === gate.id && <Feather name="check-circle" size={20} color="white" />}
                </View>
                <View className="flex-row items-center mb-1">
                  <Feather name="clock" size={14} color="white" />
                  <Text className="text-white text-sm ml-1">{gate.time}</Text>
                </View>
                <View className="mb-2">
                  <Text className="text-white text-xs opacity-80">Nhiệm vụ</Text>
                  <Text className="text-white text-sm">{gate.task}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-white text-xs opacity-80">Ngày</Text>
                    <Text className="text-white text-sm">{gate.date}</Text>
                  </View>
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