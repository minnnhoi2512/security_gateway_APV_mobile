import { Tabs } from "expo-router";
import React from "react";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import Entypo from '@expo/vector-icons/Entypo';
import { View } from "react-native";
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarStyle: {
            paddingTop: 5,
            paddingBottom: 5,
            margin: 22,
            borderRadius: 16,
            backgroundColor: "#34495e",
          },
        }}
      >
        <Tabs.Screen
          name="checkin"
          options={{
            title: "Check in",
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name="account-check"
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="checkout"
          options={{
            title: "Check out",
            // tabBarIcon: ({ color, focused }) => (
            //   <MaterialCommunityIcons
            //     name={focused ? "exit-run" : "exit-to-app"}
            //     size={24}
            //     color={color}
            //   />
            // ),
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name="exit-to-app"
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Trang chủ",
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name="home-circle"
                size={30}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="createCustomer"
          options={{
            title: "Tạo mới",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name="create-outline" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Hồ sơ",
            tabBarIcon: ({ color, focused }) => (
              <FontAwesome name="user-circle-o" size={24} color={color} />
            ),
          }}
        />

        {/* <Tabs.Screen
          name="streaming"
          options={{
            title: "Trực tiếp",
            tabBarIcon: ({ color, focused }) => (
              <Entypo name="video-camera" size={24} color={color} />
            ),
          }}
        /> */}
      </Tabs>
    </View>
  );
}
