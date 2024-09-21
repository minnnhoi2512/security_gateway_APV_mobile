import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Header from "@/components/Header";
import { useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function HomeScreen() {
  const { selectedGate } = useLocalSearchParams();
  console.log("s: ", selectedGate);
  const transactions = [
    {
      id: 1,
      title: "Lịch xây dựng kho sản xuất",
      date: "22/09/2024",
      time: "10:00AM",
      amount: -54,
    },
    {
      id: 2,
      title: "Lịch xây dựng kho sản xuất",
      date: "22/09/2024",
      time: "10:00AM",
      amount: -23,
    },
    {
      id: 3,
      title: "Lịch xây dựng kho sản xuất",
      date: "22/09/2024",
      time: "10:00AM",
      amount: -33,
    },
  ];
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header name="Đặng Dương" />
      <View className=" justify-center items-center px-4 mb-[40px]">
        <Image
          source={{
            uri: "https://www.securitymagazine.com/ext/resources/images/security-guard-freepik.jpg?1624490387",
          }}
          style={{ width: 355, height: 190, borderRadius: 25 }}
        />
      </View>

      <View className="items-center ">
        {selectedGate && (
          <Text className="text-xl font-bold">Cổng {selectedGate}</Text>
        )}
      </View>
      <ScrollView className="flex-1 bg-gray-100">
        <View className="p-4">
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold">Hôm nay</Text>
              <TouchableOpacity>
                <Text className="text-blue-500">See all</Text>
              </TouchableOpacity>
            </View>
            {transactions.map((transaction) => (
              <View key={transaction.id} className="flex-row items-center mb-4">
                <View className="bg-blue-100 rounded-full p-3 mr-3">
                  <Feather name="calendar" size={24} color="blue" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold">{transaction.title}</Text>
                  <Text className="text-gray-500 text-xs">
                    {transaction.date}, {transaction.time}
                  </Text>
                </View>
                {/* <Text className="text-red-500 font-semibold">
                  ${Math.abs(transaction.amount)}
                </Text> */}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
