import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface Visit {
  visitDetailId: number;
  expectedStartHour: string;
  expectedEndHour: string;
  status: boolean;
  visitor: {
    visitorId: number;
    visitorName: string;
    companyName: string;
    phoneNumber: string;
    credentialsCard: string;
    visitorCredentialImage: string;
    status: string;
  };
  visit: {
    visitId: number;
    visitName: string;
    visitQuantity: number;
    createByname: string | null;
    scheduleTypeName: string;
  };
}

const ListVisit: React.FC = () => {
  const { data: serializedData } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();

  let data: Visit[] = [];

  // console.log("Serialized Data:", serializedData);

  if (serializedData) {
    try {
      data = JSON.parse(serializedData);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  }

  const handlePress = (visitId: number) => {
    router.push({
      pathname: '/check-in/UserDetail',
      params: { visitId },
    });
  };

  const handleBackPress = () => {
    router.push({
      pathname: '/(tabs)/checkin',
    });
  };

  const renderVisit = ({ item }: { item: Visit }) => (
    <TouchableOpacity 
      onPress={() => handlePress(item.visit.visitId)} 
      className="bg-backgroundApp p-4 my-2 rounded-lg shadow-md"
    >
      <Text className="text-lg font-semibold mb-1 text-white">Tên chuyến thăm: {item.visit.visitName}</Text>
      <Text className="text-sm text-white mb-1">Loại lịch trình: {item.visit.scheduleTypeName}</Text>
      <Text className="text-sm mb-1 text-white ">Khách thăm: {item.visitor.visitorName}</Text>
      <Text className="text-sm mb-1 text-white">Công ty: {item.visitor.companyName}</Text>
      <Text className="text-sm mb-1 text-white">Số điện thoại: {item.visitor.phoneNumber}</Text>
      <Text className="text-sm mb-1 text-white">Giờ bắt đầu dự kiến: {item.expectedStartHour}</Text>
      <Text className="text-sm text-white">Giờ kết thúc dự kiến: {item.expectedEndHour}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-4 ">
       <Pressable
          onPress={handleBackPress}
          className="flex flex-row items-center mt-11 space-x-2 px-4 py-2 bg-gray-100 rounded-lg active:bg-gray-200"
        >
          <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
          <Text className="text-gray-600 font-medium">Quay về</Text>
        </Pressable>
      <FlatList
        data={data}
        keyExtractor={(item) => item.visitDetailId.toString()}
        renderItem={renderVisit}

        ListEmptyComponent={<Text className="text-center mt-4 text-lg text-gray-500">Không có chuyến thăm nào.</Text>}
      />
    </View>
  );
};

export default ListVisit;
