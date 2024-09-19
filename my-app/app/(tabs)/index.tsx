import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import Header from "@/components/Header";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header name="Đặng Dương" />
      <View className="flex-1 justify-center items-center px-4 mb-[180px]">
        <Image
          source={{
            uri: "https://www.securitymagazine.com/ext/resources/images/security-guard-freepik.jpg?1624490387",
          }}
          style={{ width: 355, height: 190, borderRadius: 25 }}
        />
      </View>
      <View className="flex-1"></View>
    </SafeAreaView>
  );
}
