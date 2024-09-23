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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function HomeScreen() {
  const { selectedGate } = useLocalSearchParams();
  const router = useRouter();
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
      title: "Lịch xây dựng kho sản xuất 1",
      date: "22/09/2024",
      time: "10:00AM",
      amount: -23,
    },
    {
      id: 3,
      title: "Lịch xây dựng kho sản xuất 2",
      date: "22/09/2024",
      time: "10:00AM",
      amount: -33,
    },
    {
      id: 4,
      title: "Lịch xây dựng kho sản xuất 3",
      date: "22/09/2024",
      time: "10:00AM",
      amount: -33,
    },
    {
      id: 5,
      title: "Lịch xây dựng kho sản xuất 4",
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
      <ScrollView className="flex-1 bg-gray-100">
        <View className="items-center mt-4">
          {selectedGate && (
            <Text className="text-xl text-green-500 font-bold">Cổng {selectedGate}</Text>
          )}
        </View>
        <View className="p-4">
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold">Hôm nay</Text>
              <TouchableOpacity>
                <Text className="text-blue-500">Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {transactions.map((transaction) => (
              <TouchableOpacity
              key={transaction.id}
              onPress={() => {
                router.push({
                  pathname: "/VisitDetail",
                  params: {
                    id: transaction.id,
                    title: transaction.title,
                    date: transaction.date,
                    time: transaction.time,
                    amount: transaction.amount,
                  },
                });
              }}
              className="flex-row items-center mb-4 bg-white p-3 rounded-lg"
              >
                <View className="bg-blue-100 rounded-full p-3 mr-3">
                  <Feather name="calendar" size={24} color="blue" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold mb-1">
                    {transaction.title}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {transaction.date}, {transaction.time}
                  </Text>
                </View>
                {/* <Text className="text-red-500 font-semibold">
                  ${Math.abs(transaction.amount)}
                </Text> */}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
