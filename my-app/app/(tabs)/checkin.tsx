import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Pressable } from "react-native";
import Header from "@/components/Header";
import { Link, useRouter } from "expo-router";
import { useCameraPermissions } from "expo-camera";

const Checkin = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header name="Đặng Dương" />
      <View className="flex-1 justify-center items-center px-4">
        {/* <TouchableOpacity
          className="w-full max-w-xs aspect-square bg-blue-500 rounded-lg justify-center items-center"
          onPress={() => console.log("Check-in pressed")}
        >
          <View className="w-12 h-12 border-2 border-white rounded-sm justify-center items-center">
            <View className="w-3 h-3 bg-white" />
          </View>
          <Text className="text-white text-lg font-semibold mt-4">
            Tiến hành check in
          </Text>
        </TouchableOpacity> */}
        <View>
        <Pressable onPress={requestPermission}>
            <Text>Request permissions</Text>
          </Pressable>
          <Link href={"/check-in/scanQr"} asChild>
            <Pressable disabled={!isPermissionGranted}>
              <Text style={[{ opacity: !isPermissionGranted ? 0.5 : 1 }]}>
                Scan code
              </Text>
            </Pressable>
          </Link>
        </View>
        <TouchableOpacity onPress={() => router.push('/check-in/UserDetail')} className="bg-[#5163B5] rounded-2xl p-4 items-center w-[200px] mt-4">
            <Text className="text-white font-bold text-lg">
              Next
            </Text>
          </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

export default Checkin;
