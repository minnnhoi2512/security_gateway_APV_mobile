import { View, Text, ScrollView, Image } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

const VisitDetail = () => {
  const { id, title, date, time, amount } = useLocalSearchParams();

  const users = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      phone: "0348889118",
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      phone: "0348889118",
    },
    {
      id: 3,
      name: "Lê Văn C",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      phone: "0348889118",
    },
  ];

  return (
    <ScrollView className="p-4">
      <View>
        <View className="bg-white p-4 rounded-lg shadow-lg">
          <Text className="text-2xl font-bold mb-4">{title}</Text>
          <Text className="text-gray-600 mb-2">{date}</Text>
          <Text className="text-gray-600 mb-2">{time}</Text>
        </View>

        <Text className="text-xl font-semibold mt-6 mb-4">Người tham gia</Text>

        {users.map((user) => (
          <View key={user.id} className="flex-row items-center mb-4">
            <Image
              source={{ uri: user.avatar }}
              className="w-12 h-12 rounded-full mr-4"
            />
            <Text className="text-lg">{user.name} - </Text>
            <View className="">
            <Text className="text-lg text-right ml-auto">{user.phone}</Text>

              </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default VisitDetail;
