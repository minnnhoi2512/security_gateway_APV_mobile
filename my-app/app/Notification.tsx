import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";
interface Notice {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  avatar: string;
}

const notifications = [
  {
    id: 1,
    user: "Fleur",
    action: "commented in",
    target: "Dashboard 2.0",
    time: "2 hours ago",
    type: "comment",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    user: "Lily-Rose",
    action: "followed you",
    time: "2 hours ago",
    type: "follow",
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3,
    user: "Julius",
    action: "invited you to",
    target: "Blog design",
    time: "3 hours ago",
    type: "invite",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: 4,
    user: "Adrianna",
    action: "shared a file in",
    target: "Dashboard 2.0",
    time: "4 hours ago",
    type: "file",
    fileName: "Prototype recording 01.mp4",
    fileSize: "14 MB",
    avatar: "https://i.pravatar.cc/150?img=4",
  },
  {
    id: 5,
    user: "Priya",
    action: "liked your update",
    time: "4 hours ago",
    type: "like",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
];

const Notification: React.FC = () => {
  const router = useRouter();
  const handleGoBack = () => {
    router.back();
  };

  const renderNotification = (notification: any) => (
    <TouchableOpacity
      key={notification.id}
      className="p-4 border-b border-gray-200 active:bg-gray-50"
    >
      <View className="flex-row space-x-3">
        <Image
          source={{ uri: notification.avatar }}
          className="w-8 h-8 rounded-full"
        />
        <View className="flex-1 space-y-1">
          <View className="flex-row flex-wrap">
            <Text className="font-medium">{notification.user}</Text>
            <Text className="text-gray-500 mx-1">{notification.action}</Text>
            {notification.target && (
              <Text className="font-medium">{notification.target}</Text>
            )}
          </View>

          {notification.type === "file" && (
            <View className="mt-2 p-2 bg-gray-50 rounded-lg flex-row items-center">
              <View className="flex-1">
                <Text className="text-sm text-gray-600">
                  {notification.fileName}
                </Text>
                <Text className="text-sm text-gray-400">
                  {notification.fileSize}
                </Text>
              </View>
            </View>
          )}

          {notification.type === "invite" && (
            <View className="flex-row space-x-2 mt-2">
              <TouchableOpacity className="bg-blue-600 px-4 py-1 rounded">
                <Text className="text-white text-sm">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-1 rounded">
                <Text className="text-gray-600 text-sm">Decline</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text className="text-sm text-gray-400">{notification.time}</Text>
        </View>

        {notification.id <= 2 && (
          <View className="w-2 h-2 bg-blue-600 rounded-full" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Pressable
        onPress={handleGoBack}
        className="absolute top-9  flex flex-row items-center space-x-2 px-4 py-2 rounded-lg mt-4  z-10"
      >
        <MaterialIcons name="arrow-back" size={24} color="black" />
        <Text className="text-black font-medium">Quay về</Text>
      </Pressable>
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200 mt-8">
        <View className="flex-row items-center space-x-2">
          {/* <Feather name="bell-off" size={20} color="#000" /> */}
          <Entypo name="bell" size={20} color="#f1c40f" />
          {/* <Bell size={20} color="#000" /> */}
          <Text className="text-lg font-semibold">Thông báo</Text>
          <View className="bg-blue-100 px-2 py-0.5 rounded-full">
            <Text className="text-blue-900 text-xs font-medium">2</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text className="text-2xl text-gray-400">×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {notifications.map(renderNotification)}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notification;
