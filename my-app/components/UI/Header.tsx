import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetUserProfileQuery } from "@/redux/services/user.service";
interface HeaderProps {
  name: string;
}

const Header: React.FC<HeaderProps> = ({ name }) => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useGetUserProfileQuery(userId ? { userId } : { userId: '' }, {
    skip: !userId,
  });

  // console.log("HEADER BAO VE: ", profile);
  
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

  return (
    <SafeAreaView className="bg-[#34495e]">
      <View className="p-4  h-[100px]">
        <View className="flex-row justify-between items-center mt-4">
          <View className="flex-row items-center">
            <Image
              className="mr-2"
              source={{
                uri: profile?.image || "https://cdn-icons-png.flaticon.com/512/147/147144.png",
              }}
              style={{ width: 45, height: 45, borderRadius: 25 }}
            />
            <View>
              <Text className="text-white font-semibold mb-[1px]">{profile?.fullName}</Text>
              <Text className="text-[#D9D9D9]">{profile?.role.roleName}</Text>
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
