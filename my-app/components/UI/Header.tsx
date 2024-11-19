import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetUserProfileQuery } from "@/redux/services/user.service";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
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
  } = useGetUserProfileQuery(userId ? { userId } : { userId: "" }, {
    skip: !userId,
  });
  const selectedGate = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );

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
    <SafeAreaView className="bg-backgroundApp relative rounded-b-[56px]">
      <View className="px-6 pt-4 pb-8">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center space-x-4">
            <View className="relative">
              <Image
                source={{
                  uri:
                    profile?.image ||
                    "https://cdn-icons-png.flaticon.com/512/147/147144.png",
                }}
                className="w-14 h-14 rounded-full border-2 border-white"
              />
              <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
            </View>

            <View>
              <Text className="text-white text-lg font-bold mb-0.5">
                {profile?.fullName || "Đặng Dương"}
              </Text>
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white text-sm">
                  {profile?.role.roleName === "Security"
                    ? "Bảo vệ"
                    : profile?.role.roleName === "Staff"
                    ? "Nhân viên"
                    : "Chưa xác định"}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/Notification")}
            className="relative"
          >
            <View className="bg-yellow-300 p-2 rounded-full">
              <Fontisto name="bell-alt" size={22} color="#fff" />
            </View>
            <View className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full items-center justify-center">
              <Text className="text-xs font-bold text-white">2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* {selectedGate && (
        <View className=" left-0 right-0 items-center mb-4">
          <View className="bg-white/90 px-5 py-2 rounded-full shadow-lg border border-white/30">
            <Text className="text-backgroundApp text-sm font-semibold">
              Cổng {selectedGate}
            </Text>
          </View>
        </View>
      )} */}
    </SafeAreaView>
  );
};

export default Header;
