import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useRouter } from "expo-router";
interface HeaderProps {
  name: string;
}

const Header: React.FC<HeaderProps> = ({ name }) => {
  const router = useRouter();
  return (
    <SafeAreaView className="bg-[#34495e]">
      <View className="p-4  h-[100px]">
        <View className="flex-row justify-between items-center mt-4">
          <View className="flex-row items-center">
            <Image
              className="mr-2"
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/147/147144.png",
              }}
              style={{ width: 45, height: 45, borderRadius: 25 }}
            />
            <View>
              <Text className="text-white font-semibold mb-[1px]">{name}</Text>
              <Text className="text-[#D9D9D9]">Bảo vệ</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push("/Notification")}>
            <Fontisto name="bell-alt" size={24} color={"#F7DC6F"} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Header;
