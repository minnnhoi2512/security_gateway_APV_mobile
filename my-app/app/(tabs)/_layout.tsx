import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import Entypo from "@expo/vector-icons/Entypo";
import { View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import SetSignalR from '../../hooks/signalR';
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserConnectionHubType from "@/Types/userConnectionHubType";
import * as Notifications from 'expo-notifications';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});



export default function TabLayout() {
  const [role, setRole] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const connection = useRef<signalR.HubConnection | null>(null);
  const dispatch = useDispatch();
  const connectionExist = useSelector<any>(
    (s) => s.hubConnection.connection
  ) as React.MutableRefObject<signalR.HubConnection | null>;
  // const role = useSelector((state: any) => state.auth.role);
  // console.log("ROLE NE: ", role);
  const router = useRouter();
  
  async function handleNotification() {
    await Notifications.requestPermissionsAsync()
    const {status} = await Notifications.getPermissionsAsync()
    if(status !== "granted"){
      alert("you must allow notification")
      return
    }
  }

  useEffect(() =>{
    handleNotification();
  },[])

  useEffect(() => {
    const fetchRole = async () => {
      const storedRole = await AsyncStorage.getItem("userRole");
      setRole(storedRole);
      if(!connectionExist){
        const userId = await AsyncStorage.getItem("userId");
        if (storedRole) {
        const user: UserConnectionHubType = {
          userId: Number(userId),
          role: storedRole
        }
        SetSignalR.SetSignalR(user, connection, dispatch)
        }
      }
      // if (storedRole === "Staff") {
      //   router.replace("/(tabs)/VisitForStaff");
      // }
      // console.log("ROLE FROM ASYNC STORAGE: ", storedRole);
    };
    fetchRole();
  }, []);
  
  // if (role === null) {
  //   return null;  
  // }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarStyle: {
          paddingTop: 2,
          paddingBottom: 10,
          position: "absolute",
          height: 88,
          backgroundColor: "#34495e",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 5,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="checkin"
        options={{
          title: "Check in",
          href: role === "Staff" ? null : "/(tabs)/checkin",
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
          href: role === "Staff" ? null : "/(tabs)/checkout",
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
          href: role === "Staff" ? null : "/(tabs)",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="home-circle"
              size={30}
              color={color}
            />
          ),
        }}
      />
      {/* <Tabs.Screen
          name="createCustomer"
          options={{
            href: true ? "/(tabs)/createCustomer" : null,
            title: "Tạo mới",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name="create-outline" size={24} color={color} />
            ),
          }}
        /> */}
      <Tabs.Screen 
        name="CreateCustomer"
        options={{
          href: role === "Staff" || role === "Security" ? null : "/(tabs)/CreateCustomer",
          title: "Tạo mới",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="create-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="VisitForStaff"
        options={{
          title: "Chuyến thăm",
          href: role === "Security" ? null : "/(tabs)/VisitForStaff",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name="calendar-alt" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="History"
        options={{
          title: "Lịch sử",
          href: role === "Security" ? null : "/(tabs)/History",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name="history" size={24} color={color} />
          ),
        }}
      />

      {/* <Tabs.Screen
        name="ChatForStaff"
        options={{
          title: "Trò chuyện",
          // href: role === "Security" ? null : "/(tabs)/ChatForStaff",
          tabBarIcon: ({ color, focused }) => (
            <Entypo name="chat" size={24} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="notification"
        options={{
          title: "Thông báo",
          // href: role === "Security" ? null : "/(tabs)/ChatForStaff",
          tabBarIcon: ({ color, focused }) => (
            // <Entypo name="chat" size={24} color={color} />
            <Ionicons name="notifications" size={24} color={color} />
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
  );
}


