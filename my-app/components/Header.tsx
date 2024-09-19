import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
interface HeaderProps {
  name: string;
}

const Header: React.FC<HeaderProps> = ({ name }) => {
  return (
    <View className="p-4  h-[130px]">
      <View className="flex-row justify-between items-center mt-9">
        <View className="flex-row items-center">
          <Image
            className="mr-2"
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/5301/5301945.png",
            }}
            style={{ width: 45, height: 45, borderRadius: 25 }}
            
          />
          <View>
            <Text className="text-black font-semibold mb-[1px]">{name}</Text>
            <Text className="text-[#D9D9D9]">Bảo vệ</Text>
          </View>
        </View>

        <TouchableOpacity>
          <Fontisto name="bell-alt" size={24} color={"#F7DC6F"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
