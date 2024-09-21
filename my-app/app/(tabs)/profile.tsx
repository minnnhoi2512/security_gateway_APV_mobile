import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useRouter } from "expo-router";
interface MenuItem {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  rightText?: string;
}

const Profile: React.FC = () => {
  const router = useRouter();
  const renderMenuItem = ({ icon, title, rightText }: MenuItem) => (
    <TouchableOpacity className="flex-row items-center bg-white p-4 rounded-lg mb-4">
      <View className="bg-gray-200 p-2 rounded-full mr-4">
        <Feather name={icon} size={24} color="#4B5563" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold">{title}</Text>
      </View>
      {rightText && <Text className="text-blue-500">{rightText}</Text>}
    </TouchableOpacity>
  );

  const menuItems: MenuItem[] = [
    // { icon: "bell", title: "Notifications", rightText: "ON" },
    { icon: "globe", title: "Ngôn ngữ", rightText: "Tiếng Việt" },
    { icon: "shield", title: "Bảo mật" },
    { icon: "help-circle", title: "Hỗ trợ" },
    { icon: "message-square", title: "Liên lạc với chúng tôi" },
    { icon: "lock", title: "Điều khoản" },
  ];

  return (
    <ScrollView className="bg-gray-100 flex-1">
      <View className="bg-white rounded-b-3xl pb-6 shadow">
        <View className="items-center mt-12">
          <View className="bg-blue-200 rounded-full p-1">
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/5301/5301945.png",
              }}
              className="w-24 h-24 rounded-full"
            />
          </View>
          <Text className="text-xl font-bold mt-2">Đặng Dương</Text>
          <Text className="text-gray-600">
            duong@gmail.com | +84 098 901 331
          </Text>
        </View>
      </View>

      <View className="px-4 mt-6">
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>{renderMenuItem(item)}</React.Fragment>
        ))}
       
        <TouchableOpacity onPress={() => router.push("/login")} className="flex-row items-center bg-white p-4 rounded-lg mb-4">
          <View className="bg-gray-200 p-2 rounded-full mr-4">
          <Feather name="log-out" size={24} color="#4B5563" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold">Đăng xuất</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Profile;
