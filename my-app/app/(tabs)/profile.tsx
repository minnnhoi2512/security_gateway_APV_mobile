import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { Entypo, Feather } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetUserProfileQuery } from "@/redux/services/user.service";
interface MenuItem {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  rightText?: string;
}

const Profile: React.FC = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useGetUserProfileQuery(userId ? { userId } : { userId: "" }, {
    skip: !userId,
  });
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };
    fetchUserId();
  }, []);
  const renderMenuItem = ({ icon, title, rightText }: MenuItem) => (
    <TouchableOpacity className="flex-row items-center bg-[#34495e] p-4 rounded-lg mb-2">
      <View className="bg-white p-2 rounded-full mr-4">
        <Feather name={icon} size={24} color="#4B5563" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-white">{title}</Text>
      </View>
      {rightText && <Text className="text-orange-400">{rightText}</Text>}
    </TouchableOpacity>
  );

  const menuItems: MenuItem[] = [
    // { icon: "bell", title: "Notifications", rightText: "ON" },
    { icon: "globe", title: "Ngôn ngữ", rightText: "Tiếng Việt" },
    { icon: "shield", title: "Bảo mật" },
    // { icon: "help-circle", title: "Hỗ trợ" },
    // { icon: "message-square", title: "Liên lạc với chúng tôi" },
    // { icon: "lock", title: "Điều khoản" },
  ];

  const handleNavigateToUserDetail = () => {
    router.push("/profile/ProfileDetail");
  };

  return (
    <ScrollView className="bg-gray-100 flex-1">
      <TouchableOpacity
        className="bg-[#34495e] rounded-b-3xl pb-6 shadow"
        onPress={handleNavigateToUserDetail}
      >
        <View className="items-center mt-12">
          <View className="bg-blue-200 rounded-full p-1">
            <Image
              source={{
                uri:
                  profile?.image ||
                  "https://cdn-icons-png.flaticon.com/512/5301/5301945.png",
              }}
              className="w-24 h-24 rounded-full"
            />
          </View>
          <Text className="text-xl text-white font-bold mt-2">
            {profile?.fullName}
          </Text>
          <Text className="text-white">
            {profile?.email} | {profile?.phoneNumber}
          </Text>
          {/* Optional: Add a visual indicator that this is clickable */}
          <View className="flex-row items-center mt-2">
            <Text className="text-white text-sm mr-1">Xem chi tiết</Text>
            <Feather name="chevron-right" size={16} color="white" />
          </View>
        </View>
      </TouchableOpacity>

      <View className="px-4 mt-6">
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>{renderMenuItem(item)}</React.Fragment>
        ))}

        <TouchableOpacity
          onPress={async () => {
            router.push("/check-in/streaming");
          }}
          className="flex-row items-center bg-[#34495e] p-4 rounded-lg mb-5"
        >
          <View className="bg-gray-200 p-2 rounded-full mr-4">
          
            <Entypo name="video-camera" size={24} color="#4B5563" />
          </View>
          <View className="flex-1">
            <Text className="text-lg text-white font-semibold">Xem camera</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            try {
              await AsyncStorage.removeItem("userToken");
              await AsyncStorage.removeItem("userId");
              await AsyncStorage.removeItem("userRole");

              console.log("Logout successful");
              router.push("/login");
            } catch (error) {
              console.log("Error during logout:", error);
            }
          }}
          className="flex-row items-center bg-[#34495e] p-4 rounded-lg mb-5"
        >
          <View className="bg-gray-200 p-2 rounded-full mr-4">
            <Feather name="log-out" size={24} color="#4B5563" />
          </View>
          <View className="flex-1">
            <Text className="text-lg text-white font-semibold">Đăng xuất</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Profile;
