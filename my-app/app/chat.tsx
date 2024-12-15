import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useGetAllStaffQuery } from "@/redux/services/user.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { chatDB } from "@/firebase-config";
import {
  doc,
  setDoc,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";
import { Guid } from "guid-typescript";
import ChatDetail from "./chatdetail";
import { ChevronLeft, MessageCircle, Users } from "lucide-react-native";
import { useRouter } from "expo-router";

const Chat = () => {
  const { data: staff } = useGetAllStaffQuery({});
  const [currentUserId, setCurrentUserId] = useState<number | null>(0);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await AsyncStorage.getItem("userId");
      setCurrentUserId(userId ? parseInt(userId, 10) : null);
    };
    fetchUserId();
  }, []);

  const handleSelect = async (user: any) => {
    try {
      if (!currentUserId) {
        console.error("Current user ID is not set");
        return;
      }

      const chatQuery = query(
        collection(chatDB, "chats"),
        where("participants", "array-contains", currentUserId)
      );

      const chatQuerySnapshot = await getDocs(chatQuery);
      let chatRoomExists = false;
      let chatId = "";

      chatQuerySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(user.userId)) {
          chatRoomExists = true;
          chatId = doc.id;
        }
      });

      if (chatRoomExists) {
        setSelectedChat({
          chatId,
          senderId: currentUserId,
          receiverId: user.userId,
        });
      } else {
        chatId = Guid.create().toString();
        const chatDocRef = doc(chatDB, "chats", chatId);
        await setDoc(chatDocRef, {
          participants: [currentUserId, user.userId],
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setSelectedChat({
          chatId,
          senderId: currentUserId,
          receiverId: user.userId,
        });
      }
    } catch (error) {
      console.error("Error selecting chat: ", error);
    }
  };

  const handleGoBack = () => {
    if (selectedChat) {
      setSelectedChat(null);
    } else {
      router.back();
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      className="mb-2 mx-4 bg-white rounded-xl shadow-sm border border-gray-100"
    >
      <View className="p-3 flex-row items-center">
        <View className="relative">
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              className="w-12 h-12 rounded-full bg-gray-100"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
              <Text className="text-blue-500 font-semibold text-lg">
                {item.fullName?.charAt(0)}
              </Text>
            </View>
          )}
          <View className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
        </View>

        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-800" numberOfLines={1}>
            {item.fullName}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-xs text-gray-500">
              {item.role.roleName === "Staff"
                ? "Nhân viên"
                : item.role.roleName}
            </Text>
            <View className="w-1 h-1 rounded-full bg-gray-300 mx-2" />
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {item.department.departmentName}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-100 bg-white">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={handleGoBack}
            className="p-2 -ml-2 mr-2"
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>

          <View className="flex-row items-center flex-1">
            <MessageCircle size={20} color="#3b82f6" />
            <Text className="text-lg font-semibold text-gray-800 ml-2">
              {selectedChat ? "Chat" : "Tin nhắn"}
            </Text>
          </View>
        </View>

        {!selectedChat && (
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-500 mr-1">
              {staff?.length || 0}
            </Text>
            <Users size={16} color="#6b7280" />
          </View>
        )}
      </View>

      {selectedChat ? (
        <ChatDetail
          chatId={selectedChat.chatId}
          senderId={selectedChat.senderId}
          receiverId={selectedChat.receiverId}
        />
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Chat;
