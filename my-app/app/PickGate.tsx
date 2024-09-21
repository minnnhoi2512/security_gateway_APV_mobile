import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";

const PickGate: React.FC = () => {
  const router = useRouter();
  const [selectedGate, setSelectedGate] = useState<string | null>(null);

  // Data for gates
  const gates = [
    { id: 'A', color: 'bg-teal-600', name: 'Cổng A', time: '7h00 - 17h30', task: 'Kiểm tra khách vào - ra trong công ty', date: '22/09/2024' },
    { id: 'B', color: 'bg-yellow-700', name: 'Cổng B', time: '7h00 - 17h30', task: 'Kiểm tra khách vào - ra trong công ty', date: '22/09/2024' },
    { id: 'C', color: 'bg-blue-600', name: 'Cổng C', time: '7h00 - 17h30', task: 'Kiểm tra khách vào - ra trong công ty', date: '22/09/2024' }
  ];


  const handleSelectGate = (id: string) => {
    setSelectedGate(id);
  };

  const handleNext = () => {
    if (selectedGate) {
      router.push({
        pathname: "/(tabs)",
        params: {selectedGate  }
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#FAFAFA] mt-14">
      <View className="p-4">
        <View className="justify-between text-center items-center mb-4">
          <Text className="text-2xl font-bold">Chọn cổng của bạn</Text>
        </View>

        {gates.map(gate => (
          <TouchableOpacity key={gate.id} onPress={() => handleSelectGate(gate.id)}>
            <View className={`${gate.color} rounded-xl p-4 mb-6 ${selectedGate === gate.id ? 'border-4 border-green-600' : ''}`}>
              <Text className="text-white text-lg font-semibold mb-2">{gate.name}</Text>
              <Text className="text-white text-lg mb-4">Thời gian: {gate.time}</Text>
              <View className="flex-row justify-between items-end">
                <View>
                  <Text className="text-white text-xs">Nhiệm vụ</Text>
                  <Text className="text-white">{gate.task}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-white text-xs">Thời gian</Text>
                  <Text className="text-white">{gate.date}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={handleNext}
          className="bg-[#5163B5] rounded-2xl p-4 items-center w-[200px] mt-4 self-center"
          disabled={!selectedGate} 
        >
          <Text className="text-white font-bold text-lg">Tiếp theo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PickGate;
